/**
 * Detail view for a single project, plus the hash router that decides when one
 * should be on screen.
 *
 * Deliberate boundary: renderProjectDetail returns a detached <article> and
 * knows nothing about where it will be put. It never reads or writes the
 * document, never listens for anything, and never closes itself. Every piece of
 * modal machinery -- focus, Escape, the backdrop, the trap -- lives in
 * js/project-overlay.js instead. The point is that swapping the overlay for a
 * real /<slug> page should not touch this file at all.
 *
 * All text goes in through textContent. There is no innerHTML here, so a stray
 * angle bracket in the config is a stray angle bracket on screen, not markup.
 */

/** Route shape. Kept in one place so the writer and the reader cannot drift. */
const ROUTE_PREFIX = '#/';

const isBlank = (value) => typeof value !== 'string' || value.trim() === '';

/** Absolute or scheme-relative URLs leave the site; in-page hashes do not. */
const isExternal = (href) =>
  /^([a-z][a-z0-9+.-]*:|\/\/)/i.test(href) && !href.startsWith('#');

/** The canonical URL fragment for a project. */
export function hashForSlug(slug) {
  return `${ROUTE_PREFIX}${encodeURIComponent(String(slug))}`;
}

/**
 * Pull a slug back out of a fragment. Returns null for anything that is not a
 * entry route, which includes the empty fragment and legacy anchors such as
 * "#contact", so those fall through to normal browser behaviour.
 */
export function slugFromHash(hash) {
  const raw = String(hash || '');
  if (!raw.startsWith(ROUTE_PREFIX)) return null;
  const encoded = raw.slice(ROUTE_PREFIX.length);
  if (encoded === '') return null;
  try {
    return decodeURIComponent(encoded);
  } catch {
    // A malformed escape sequence is not a slug. Treat it as a miss, not a throw.
    return encoded;
  }
}

/* ------------------------------------------------------------------ render */

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

/**
 * One image in its figure.
 *
 * `caption` is false in the lead position. The lead has never shown a caption,
 * and several records carry one on images[0] purely because it came across from
 * the old slide deck; rendering it there would move the summary down the card.
 *
 * `lazy` is likewise only true for the lead, which has carried loading and
 * decoding hints since before the gallery existed. The stacked images take
 * neither, so nothing about how they load is being decided here.
 */
function figureFor(entry, { caption = true, lazy = false } = {}) {
  const figure = el('figure', 'detail__figure');

  const image = el('img', 'detail__image');
  image.src = entry.src;
  image.alt = entry.alt;
  if (lazy) {
    image.loading = 'lazy';
    image.decoding = 'async';
  }
  figure.append(image);

  if (caption && !isBlank(entry.caption)) {
    figure.append(el('figcaption', 'detail__caption', entry.caption));
  }

  return figure;
}

function linkItem(label, href) {
  const item = el('li', 'detail__links-item');
  const anchor = el('a', 'link-caps detail__link', label);
  anchor.href = href;
  if (isExternal(href)) {
    anchor.target = '_blank';
    anchor.rel = 'noopener noreferrer';
  }
  item.append(anchor);
  return item;
}

/**
 * Build the detail card for one project.
 *
 * @param {object} project a record from js/projects.js
 * @param {object} [opts]
 * @param {boolean} [opts.placeholders=true] when true, a blank prose field is
 *   rendered as a visible stand-in so the gap is obvious while authoring. When
 *   false, blank fields are omitted entirely and the card is simply shorter.
 * @param {string} [opts.idPrefix='project-detail'] prefix for the generated
 *   heading id. The caller needs that id to point aria-labelledby at the title.
 * @param {number} [opts.headingLevel=2]
 * @returns {HTMLElement} a detached <article>
 */
export function renderProjectDetail(project, opts = {}) {
  const { placeholders = true, idPrefix = 'project-detail', headingLevel = 2 } = opts;

  const article = el('article', 'detail');
  article.dataset.slug = project.slug;
  article.dataset.lens = project.lens;

  if (!isBlank(project.lensLabel)) {
    article.append(el('p', 'detail__lens', project.lensLabel));
  }

  // The heading is not optional even when the title is: whatever contains this
  // card may be labelled by it, and an unlabelled dialog is a dead end for a
  // screen reader. Fall back through name to slug rather than emitting nothing.
  const heading = el(`h${headingLevel}`, 'detail__title');
  heading.id = `${idPrefix}-title`;
  heading.textContent = isBlank(project.title)
    ? project.name || project.slug
    : project.title;
  article.append(heading);

  if (!isBlank(project.subtitle)) {
    article.append(el('p', 'detail__subtitle', project.subtitle));
  } else if (placeholders) {
    article.append(el('p', 'detail__subtitle detail__placeholder', 'No subtitle yet.'));
  }

  // images[0] is the lead. It sits above the summary, which is where the card
  // has always opened on a picture.
  const images = Array.isArray(project.images) ? project.images : [];
  if (images.length > 0) {
    article.append(figureFor(images[0], { caption: false, lazy: true }));
  }

  if (!isBlank(project.summary)) {
    article.append(el('p', 'detail__summary', project.summary));
  } else if (placeholders) {
    article.append(el('p', 'detail__summary detail__placeholder', 'No summary yet.'));
  }

  // Everything after the lead stacks below the summary, one image per row. The
  // container is only built when there is something to put in it, so a
  // single-image record ends at the summary rather than at an empty div.
  if (images.length > 1) {
    const gallery = el('div', 'detail__gallery');
    for (const entry of images.slice(1)) gallery.append(figureFor(entry));
    article.append(gallery);
  }

  const links = Array.isArray(project.links) ? project.links : [];
  if (links.length > 0) {
    const list = el('ul', 'detail__links');
    for (const link of links) list.append(linkItem(link.label, link.href));
    article.append(list);
  }

  return article;
}

/* ------------------------------------------------------------------ router */

/**
 * Watch the fragment and report what should be on screen.
 *
 * The router owns no DOM. It answers three questions by calling back: open this
 * project, close whatever is open, or this slug does not exist. It is the
 * caller's job to decide what those mean visually.
 *
 * @param {object} deps
 * @param {{get(slug: string): object|undefined}} deps.index
 * @param {(project: object) => void} [deps.onOpen]
 * @param {() => void} [deps.onClose]
 * @param {(slug: string) => void} [deps.onMissing]
 * @returns {{start(): void, stop(): void, close(): void, current(): string|null}}
 */
export function createProjectRouter({ index, onOpen, onClose, onMissing }) {
  let currentSlug = null;

  // Whether a project route was reached by navigating within the page, as
  // opposed to being typed or pasted into the address bar. Only in the first
  // case is there a history entry of our own worth stepping back over.
  let reachedByNavigation = false;
  let listening = false;

  const call = (fn, arg) => {
    if (typeof fn !== 'function') return;
    try {
      fn(arg);
    } catch (error) {
      // A throwing callback must not leave the router mid-transition, or the
      // next hashchange would be evaluated against stale state.
      console.error('[projects] router callback failed', error);
    }
  };

  function evaluate(fromNavigation) {
    const slug = slugFromHash(window.location.hash);

    if (slug === null) {
      if (currentSlug !== null) {
        currentSlug = null;
        reachedByNavigation = false;
        call(onClose);
      }
      return;
    }

    if (slug === currentSlug) return;

    const project = index.get(slug);
    if (!project) {
      // Unknown slug: report it and make sure nothing is left open. The wheel
      // stays exactly where it was.
      const wasOpen = currentSlug !== null;
      currentSlug = null;
      reachedByNavigation = false;
      if (wasOpen) call(onClose);
      call(onMissing, slug);
      return;
    }

    currentSlug = slug;
    reachedByNavigation = fromNavigation;
    call(onOpen, project);
  }

  function onHashChange() {
    evaluate(true);
  }

  return {
    start() {
      if (listening) return;
      window.addEventListener('hashchange', onHashChange);
      listening = true;
      // A cold load on #/<slug> is not navigation we can step back over.
      evaluate(false);
    },

    stop() {
      if (!listening) return;
      window.removeEventListener('hashchange', onHashChange);
      listening = false;
    },

    /**
     * Leave the current project route.
     *
     * When we got here by clicking a marker, stepping back is the honest undo:
     * it keeps Back and Forward symmetric, so Forward reopens what Escape just
     * closed. On a cold load there is no such entry -- going back would leave
     * the site -- so the route is replaced and the close reported directly.
     */
    close() {
      if (currentSlug === null) return;

      if (reachedByNavigation) {
        // The resulting hashchange runs evaluate(), which fires onClose.
        window.history.back();
        return;
      }

      currentSlug = null;
      reachedByNavigation = false;
      const { pathname, search } = window.location;
      window.history.replaceState(null, '', `${pathname}${search}`);
      call(onClose);
    },

    current() {
      return currentSlug;
    },
  };
}

export default createProjectRouter;
