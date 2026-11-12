/**
 * Builds a lookup index over data/site.config.js.
 *
 * Entry records are authored once in a top-level collection; segments refer
 * to them by slug. The detail view needs a flat, slug-keyed collection that
 * still knows which lens each project belongs to. This module is the only place
 * that translation happens.
 *
 * Vocabulary note: the config calls them `segments` and `entries`; past this
 * boundary they are lenses and projects.
 *
 * Nothing here throws. A malformed or half-authored record is reported to the
 * console and then either skipped (no usable slug) or passed through thinner
 * than intended (missing prose), because a content typo should cost a card, not
 * the whole page.
 */

/** Fields the detail view renders as prose. Blank ones earn a warning. */
const PROSE_FIELDS = ['title', 'subtitle', 'summary'];

const isBlank = (value) => typeof value !== 'string' || value.trim() === '';

/** Slugs travel in URLs and in attribute selectors, so keep them boring. */
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function warn(message) {
  // Grouped under one prefix so a content author can filter for it.
  console.warn(`[projects] ${message}`);
}

/**
 * Normalize an entry's image collection.
 *
 * An image with no alt text is worse than no image, so a bad entry is dropped
 * whole rather than rendered mute. That has a consequence worth stating: the
 * first surviving entry is the lead, so dropping entry zero promotes entry one
 * into the lead position. A thinner card with a different lead beats a card
 * with an unlabelled image on it.
 *
 * `caption` is optional and stays empty when absent; the lead's caption is
 * never rendered anyway. See decisions/ADR-0005.
 */
function toImages(value, slug) {
  const entries = Array.isArray(value) ? value : [];

  return entries
    .map((entry, i) => {
      if (!entry || typeof entry !== 'object') {
        warn(`"${slug}": image ${i} is not an object; skipped.`);
        return null;
      }

      const src = isBlank(entry.src) ? '' : entry.src.trim();
      if (src === '') {
        warn(`"${slug}": image ${i} has no src; skipped.`);
        return null;
      }

      const alt = isBlank(entry.alt) ? '' : entry.alt.trim();
      if (alt === '') {
        warn(`"${slug}": image "${src}" has no alt; skipped.`);
        return null;
      }

      const caption = isBlank(entry.caption) ? '' : entry.caption.trim();
      return { src, alt, caption };
    })
    .filter((entry) => entry !== null);
}

/** A trimmed string, or '' for anything that is not non-blank text. */
const text = (value) => (isBlank(value) ? '' : value.trim());

/** A same-site, relative path to a .json file: no scheme, no leading slash, no "..". */
const CONTENT_PATH = /^(?![a-z][a-z0-9+.-]*:)(?!\/)(?!.*\.\.)[\w./-]+\.json$/i;

/**
 * Validate an entry's optional `content` reference. See decisions/ADR-0008.
 * Only the path is checked here; the file is fetched when its modal opens.
 */
function toContentPath(value, slug) {
  if (value === undefined) return '';
  const path = text(value);
  if (!CONTENT_PATH.test(path)) {
    warn(`"${slug}": content "${value}" is not a relative .json path; ignored.`);
    return '';
  }
  return path;
}

/**
 * Normalize a fetched content file into a case study. See decisions/ADR-0008.
 *
 * Every part is optional and every part degrades the same way as the rest of
 * this file: a malformed piece is warned about and dropped, never thrown. The
 * result is null when nothing usable is left, so the caller can test for a
 * case study with a single truthiness check.
 */
export function normalizeCaseStudy(value, slug) {
  if (!value || typeof value !== 'object') {
    warn(`"${slug}": content file is not a JSON object; skipped.`);
    return null;
  }

  const pairs = (list, field, keyName, valueName) =>
    (Array.isArray(list) ? list : [])
      .map((item, i) => {
        const key = text(item?.[keyName]);
        const val = text(item?.[valueName]);
        if (key === '' || val === '') {
          warn(`"${slug}": content ${field} ${i} needs ${keyName} and ${valueName}; skipped.`);
          return null;
        }
        return { [keyName]: key, [valueName]: val };
      })
      .filter((item) => item !== null);

  const glance = pairs(value.glance, 'glance', 'label', 'value');

  const sections = (Array.isArray(value.sections) ? value.sections : [])
    .map((section, i) => {
      const heading = text(section?.heading);
      if (heading === '') {
        warn(`"${slug}": content section ${i} has no heading; skipped.`);
        return null;
      }
      // toImages already enforces src and alt; a section holds at most one.
      const [figure = null] = toImages(section.figure ? [section.figure] : [], slug);
      return {
        heading,
        intro: text(section.intro),
        figure,
        points: pairs(section.points, `section "${heading}" point`, 'term', 'text'),
      };
    })
    .filter((section) => section !== null);

  const stack = (Array.isArray(value.stack) ? value.stack : [])
    .map(text)
    .filter((item) => item !== '');

  if (glance.length === 0 && sections.length === 0 && stack.length === 0) {
    warn(`"${slug}": content file has nothing renderable; skipped.`);
    return null;
  }

  return { glance, sections, stack };
}

/**
 * Normalize one entry into a project record. Returns null when the record has
 * no usable slug, since without one it can be neither addressed nor deduplicated.
 */
function toProject(entry, lens, position) {
  const where = lens
    ? `lens "${lens.id}", position ${position}`
    : `unsegmented entry at position ${position}`;

  if (!entry || typeof entry !== 'object') {
    warn(`${where}: not an object; skipped.`);
    return null;
  }

  const slug = typeof entry.slug === 'string' ? entry.slug.trim() : '';
  if (slug === '') {
    warn(`${where} ("${entry.name || 'unnamed'}"): no slug; skipped.`);
    return null;
  }
  if (!SLUG_PATTERN.test(slug)) {
    warn(
      `${where}: slug "${slug}" is not lowercase-hyphenated; it will still ` +
        'work but will look wrong in a URL.',
    );
  }

  for (const field of PROSE_FIELDS) {
    if (isBlank(entry[field])) {
      warn(`"${slug}": ${field} is empty.`);
    }
  }

  const images = toImages(entry.images, slug);

  const links = (Array.isArray(entry.links) ? entry.links : [])
    .filter((link) => link && !isBlank(link.label) && !isBlank(link.href))
    .map((link) => ({ label: link.label.trim(), href: link.href.trim() }));

  return {
    slug,
    name: isBlank(entry.name) ? slug : entry.name.trim(),
    title: isBlank(entry.title) ? '' : entry.title.trim(),
    subtitle: isBlank(entry.subtitle) ? '' : entry.subtitle.trim(),
    summary: isBlank(entry.summary) ? '' : entry.summary.trim(),
    images,
    links,
    content: toContentPath(entry.content, slug),
    lens: lens?.id || '',
    lensLabel: lens?.label || '',
  };
}

function toLens(segment, position) {
  const id = typeof segment?.id === 'string' ? segment.id.trim() : '';
  if (id === '') {
    warn(`segment at position ${position}: no id; skipped.`);
    return null;
  }
  return {
    id,
    label: isBlank(segment.label) ? id : segment.label.trim(),
  };
}

/** Resolve a segment's ordered entry references. */
export function entriesForSegment(config, segment) {
  const records =
    config?.entries && typeof config.entries === 'object'
      ? config.entries
      : {};
  const refs = Array.isArray(segment?.entries) ? segment.entries : [];

  return refs
    .map((slug) => records[slug])
    .filter((entry) => entry && typeof entry === 'object');
}

/**
 * @param {object} config the object exported by data/site.config.js
 * @returns {{
 *   get(slug: string): object | undefined,
 *   forLens(lensId: string): object[],
 *   lens(lensId: string): object | undefined,
 *   lenses: object[],
 *   projects: object[],
 * }}
 */
export function buildIndex(config) {
  const segments = Array.isArray(config?.segments) ? config.segments : [];
  if (segments.length === 0) warn('config has no segments.');

  const entryRecords =
    config?.entries && typeof config.entries === 'object'
      ? config.entries
      : {};
  if (Object.keys(entryRecords).length === 0) warn('config has no entries.');

  const lenses = [];
  const projects = [];
  const bySlug = new Map();
  const byLens = new Map();
  const referencedSlugs = new Set();

  segments.forEach((segment, segmentIndex) => {
    const lens = toLens(segment, segmentIndex);
    if (!lens) return;

    lenses.push(lens);
    const own = [];
    byLens.set(lens.id, own);

    const refs = Array.isArray(segment.entries) ? segment.entries : [];
    refs.forEach((slug) => referencedSlugs.add(slug));
    const entries = entriesForSegment(config, segment);
    if (entries.length !== refs.length) {
      refs.forEach((slug) => {
        if (!entryRecords[slug]) {
          warn(`lens "${lens.id}": entry reference "${slug}" was not found.`);
        }
      });
    }
    entries.forEach((entry, entryIndex) => {
      const project = toProject(entry, lens, entryIndex);
      if (!project) return;

      if (bySlug.has(project.slug)) {
        warn(`duplicate slug "${project.slug}"; the later record is skipped.`);
        return;
      }

      bySlug.set(project.slug, project);
      projects.push(project);
      own.push(project);
    });
  });

  Object.entries(entryRecords).forEach(([key, entry], entryIndex) => {
    if (referencedSlugs.has(key)) return;

    const project = toProject(entry, null, entryIndex);
    if (!project) return;

    if (bySlug.has(project.slug)) {
      warn(`duplicate slug "${project.slug}"; the later record is skipped.`);
      return;
    }

    bySlug.set(project.slug, project);
    projects.push(project);
  });

  const byLensId = new Map(lenses.map((lens) => [lens.id, lens]));

  return {
    get: (slug) => bySlug.get(String(slug)),
    forLens: (lensId) => (byLens.get(String(lensId)) || []).slice(),
    lens: (lensId) => byLensId.get(String(lensId)),
    lenses,
    projects,
  };
}

export default buildIndex;
