/**
 * Generates the instrument dial from data/site.config.js.
 *
 * Nothing here knows how many segments there are. Arc angles come from each
 * segment's `weight` as a proportion of the total, so editing a weight, adding
 * a segment, or deleting one reflows the entire dial with no other change.
 *
 * Geometry constants are transcribed from the design source, assets/mockupv0.svg
 * (viewBox 0 0 1000 700, dial centre 500,352). Decorative rings, spokes, and
 * ticks are produced by loops over those constants rather than stored as
 * coordinate lists.
 *
 * Colour never appears here as a literal. Per-segment colours from the config
 * are written onto each group as the custom properties --seg-color and
 * --seg-bevel; styles/landing.css does all the painting through var().
 *
 * Beyond drawing, this file is only a wiring point for the detail view: it
 * points each marker at #/p/<slug> and hands the router and the overlay to each
 * other in initProjectDetail. The view itself lives in js/project-view.js.
 */

import config from '../data/site.config.js';
import { artifactsForSegment, buildIndex } from './projects.js';
import {
  createProjectRouter,
  hashForSlug,
  renderProjectDetail,
} from './project-view.js';
import { createProjectOverlay } from './project-overlay.js';
import { createTitleSweep } from './title-sweep.js';

const SVG_NS = 'http://www.w3.org/2000/svg';

const CENTRE = { x: 500, y: 352 };

/** Radii, in viewBox units, from assets/mockupv0.svg. */
const R = {
  band: 137,
  highlight: 163,
  // Outside the band's focused width (137 + 62/2 = 168) so the focus ring reads
  // as an outline rather than blending into the highlight.
  focusRing: 172,
  caseRing: 200,
  caseInner: 194.5,
  tickInner: 205,
  tickOuter: 211,
  goldMajorInner: 171,
  goldMinorInner: 178,
  goldOuter: 190,
  boundaryTab: 213,
  lensWell: 105,
  lensClip: 103,
  lensBright: 101,
  lensShade: 97,
  hairlineFrom: 214,
  hairlineTo: 445,
  hairlineStep: 7,
  spokeFrom: 214,
  spokeTo: 450,
};

/** Angular layout. A gap is centred on 12 o'clock, as in the mockup. */
const GAP_DEG = 7;
const START_DEG = -90;

/** Tick cadence, matching the mockup exactly. */
const TICK_STEP_DEG = 2;
const GOLD_MAJOR_STEP_DEG = 30;
const GOLD_MINOR_STEP_DEG = 5;
const SPOKE_STEP_DEG = 3.75;

/** Keep generated text and markers this far inside the viewBox edge. */
const FRAME_INSET = 22;

/** Full authored frame, matching assets/mockupv0.svg. */
const FULL_FRAME = { x: 0, y: 0, width: 1000, height: 700 };

/**
 * How far the backdrop ribbons run past the viewBox on each side. The SVG uses
 * preserveAspectRatio "meet", so on most viewports the viewBox is letterboxed;
 * the overhang keeps the ribbons bleeding to the window edge instead of ending
 * in a visible rectangle.
 */
const RIBBON_OVERHANG = 1400;

const COMPACT_QUERY = '(max-width: 720px)';

/**
 * Label, title, and marker placement, one entry per breakpoint.
 *
 * The two entries are not the same layout at two sizes: wide arranges the lens
 * blocks radially, compact lists them under the dial. computePlacements picks
 * between them on `stacked`, and each entry only carries the fields its own
 * layout reads.
 *
 * What they share is that every line is positioned from the project counts and
 * never from how many titles happen to be visible, so the reveal in
 * js/title-sweep.js cannot move anything in either layout.
 */
const PLACEMENT = {
  wide: {
    frame: FULL_FRAME,
    labelRadius: 300,
    labelSize: 13.5,
    labelTracking: 3.4,
    titleOffset: 20,
    titleLeading: 13,
    markerGap: 18,
    markerRadius: 14,
    markerPitch: 32,
    markerLabelSize: 9.5,
  },
  /*
   * Compact keeps the dial and gives up the radial title arrangement.
   *
   * The old compact layout kept the ring and paid for it in type size: titles
   * landed at about 4.3 rendered pixels on a 375-wide viewport, which is present
   * but not readable, and the sweep turned that from a passing hover state into
   * the resting one. Radial cannot be rescued here -- see the note on
   * computePlacements for the arithmetic -- so the frame becomes a portrait
   * window on the dial and the lenses list down the space underneath, which the
   * old 1000x700 frame was letterboxing away.
   *
   * The frame is a window, not a move: the dial is still drawn around CENTRE, and
   * frame is centred on it horizontally. Width is what fixes the scale here --
   * styles/landing.css gives the compact dial an intrinsic height, so the frame
   * is free to be taller than the viewport and the page scrolls. That is the
   * whole reason 44px rows are affordable: squeezing the list into one screen
   * would make the scale height-bound at about 0.44 and shrink the dial by a
   * third to pay for the taller rows.
   */
  compact: {
    stacked: true,
    frame: { x: 240, y: 72, width: 520, height: 1160 },
    labelSize: 18,
    labelTracking: 3.6,
    /** First title's baseline below the lens label's. */
    titleOffset: 30,
    /**
     * Row pitch, and so the height of a row's hit area. 64 units at the compact
     * scale of 0.69 is a 44px target; the marker and the type stay the size they
     * look best at and only the target grows.
     */
    titleLeading: 64,
    /** Gap between one lens block and the next. */
    blockGap: 22,
    /** Space between a marker and the title it belongs to. */
    markerTitleGap: 12,
    /** Where the list starts, clear of the dial's outer case. */
    stackTop: 611,
    markerRadius: 13,
    markerLabelSize: 17,
  },
};

/**
 * Letterspacing on a project title, matching .hex__label in
 * styles/landing.css. Width estimation has to agree with what is painted or the
 * frame clamping goes wrong, so the number is duplicated deliberately and both
 * copies say so.
 */
const TITLE_TRACKING = 0.6;

/* ------------------------------------------------------------------ helpers */

/** Trim float noise out of generated path data. */
const round = (n) => Math.round(n * 100) / 100;

function svg(name, attrs = {}) {
  const node = document.createElementNS(SVG_NS, name);
  for (const [key, value] of Object.entries(attrs)) {
    if (value === undefined || value === null) continue;
    node.setAttribute(key, String(value));
  }
  return node;
}

function polar(radius, degrees) {
  const rad = (degrees * Math.PI) / 180;
  return {
    x: CENTRE.x + radius * Math.cos(rad),
    y: CENTRE.y + radius * Math.sin(rad),
  };
}

/**
 * Arc from a0 to a1 at a fixed radius. The large-arc flag is derived from the
 * sweep rather than assumed, so a segment wider than 180 degrees still draws --
 * which is exactly what happens when the config drops to one or two segments.
 */
function arcPath(radius, a0, a1) {
  const sweep = a1 - a0;
  const from = polar(radius, a0);
  const to = polar(radius, a1);
  const largeArc = Math.abs(sweep) > 180 ? 1 : 0;
  const clockwise = sweep >= 0 ? 1 : 0;
  return (
    `M ${round(from.x)} ${round(from.y)} ` +
    `A ${radius} ${radius} 0 ${largeArc} ${clockwise} ${round(to.x)} ${round(to.y)}`
  );
}

/** Radial tick as a line between two radii at one angle. */
function radialLine(innerRadius, outerRadius, degrees, className) {
  const a = polar(innerRadius, degrees);
  const b = polar(outerRadius, degrees);
  return svg('line', {
    x1: round(a.x),
    y1: round(a.y),
    x2: round(b.x),
    y2: round(b.y),
    class: className,
  });
}

/** Regular hexagon, as in the mockup: vertices at +/-r on x and +/-r/2, +/-r*sin60. */
function hexPoints(cx, cy, r) {
  const h = round(r * Math.sin(Math.PI / 3));
  const half = round(r / 2);
  return [
    [cx + r, cy],
    [cx + half, cy + h],
    [cx - half, cy + h],
    [cx - r, cy],
    [cx - half, cy - h],
    [cx + half, cy - h],
  ]
    .map(([x, y]) => `${round(x)},${round(y)}`)
    .join(' ');
}

/**
 * Rough advance width for a run of text. Only needs to be good enough to keep
 * generated labels inside the frame; SVG gives us no measurement before paint.
 */
function estimateTextWidth(text, fontSize, tracking, uppercase) {
  const perChar = fontSize * (uppercase ? 0.68 : 0.5);
  return text.length * perChar + Math.max(0, text.length - 1) * tracking;
}

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

/** Anchor from which side of the dial the ray points at. */
function anchorFor(degrees) {
  const c = Math.cos((degrees * Math.PI) / 180);
  if (c > 0.25) return 'start';
  if (c < -0.25) return 'end';
  return 'middle';
}

/** Keep a text box of the given width inside the frame for its anchor. */
function clampAnchoredX(x, width, anchor, frame) {
  const lo = frame.x + FRAME_INSET;
  const hi = frame.x + frame.width - FRAME_INSET;
  if (anchor === 'start') return clamp(x, lo, Math.max(lo, hi - width));
  if (anchor === 'end') return clamp(x, Math.min(hi, lo + width), hi);
  return clamp(x, lo + width / 2, Math.max(lo + width / 2, hi - width / 2));
}

const isExternal = (href) =>
  /^[a-z][a-z0-9+.-]*:/i.test(href) && !href.startsWith('#');

/* ------------------------------------------------------------------- layout */

/**
 * Derive each segment's arc from its weight. Gaps straddle the boundaries so
 * one gap is centred on 12 o'clock regardless of segment count.
 */
function computeLayout(segments) {
  const weights = segments.map((s) =>
    Number(s.weight) > 0 ? Number(s.weight) : 0,
  );
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  const available = 360 - segments.length * GAP_DEG;

  // Degenerate configs (no segments, or all weights zero) fall back to equal shares.
  const share = (i) =>
    totalWeight > 0
      ? weights[i] / totalWeight
      : 1 / Math.max(1, segments.length);

  let cursor = START_DEG + GAP_DEG / 2;
  return segments.map((segment, i) => {
    const sweep = share(i) * available;
    const start = cursor;
    const end = start + sweep;
    cursor = end + GAP_DEG;
    return { segment, index: i, start, end, sweep, mid: start + sweep / 2 };
  });
}

/* ---------------------------------------------------------------- backdrop */

function buildBackdrop(mount) {
  // No ground rect here: the body gradient in styles/landing.css covers the
  // whole viewport, so the field does not stop at the viewBox edge when the
  // SVG letterboxes. The ribbons are oversized for the same reason.
  const ribbons = [
    { rotate: -27, y: 150, height: 176, variant: 'green' },
    { rotate: 33, y: 268, height: 132, variant: 'blue' },
    { rotate: -27, y: 426, height: 56, variant: 'gold' },
  ];
  for (const ribbon of ribbons) {
    const group = svg('g', { transform: `rotate(${ribbon.rotate} 500 340)` });
    group.append(
      svg('rect', {
        x: -RIBBON_OVERHANG,
        y: ribbon.y,
        width: FULL_FRAME.width + RIBBON_OVERHANG * 2,
        height: ribbon.height,
        class: `dial__ribbon dial__ribbon--${ribbon.variant}`,
      }),
    );
    mount.append(group);
  }

  // Concentric hairlines outside the case.
  for (let r = R.hairlineFrom; r <= R.hairlineTo; r += R.hairlineStep) {
    mount.append(
      svg('circle', { cx: CENTRE.x, cy: CENTRE.y, r, class: 'dial__hairline' }),
    );
  }

  // Radial hairlines.
  for (let a = 0; a < 360; a += SPOKE_STEP_DEG) {
    mount.append(radialLine(R.spokeFrom, R.spokeTo, a, 'dial__spoke'));
  }
}

/* -------------------------------------------------------------------- case */

function buildCase(mount, layout) {
  // Index tab at each segment boundary, so the tabs track the weights too.
  const boundaries = layout.flatMap(({ start, end }) => [start, end]);
  for (const angle of boundaries) {
    const point = polar(R.boundaryTab, angle);
    const tab = svg('g', {
      transform: `translate(${round(point.x)},${round(point.y)}) rotate(${round(angle)})`,
    });
    tab.append(
      svg('rect', {
        x: -8,
        y: -6.5,
        width: 16,
        height: 13,
        class: 'dial__tab-body',
      }),
      svg('rect', {
        x: -2.5,
        y: -2,
        width: 5,
        height: 4,
        class: 'dial__tab-slot',
      }),
    );
    mount.append(tab);
  }

  mount.append(
    svg('circle', {
      cx: CENTRE.x,
      cy: CENTRE.y,
      r: R.caseRing,
      class: 'dial__case',
    }),
    svg('circle', {
      cx: CENTRE.x,
      cy: CENTRE.y,
      r: R.caseInner,
      class: 'dial__case-inner',
    }),
  );

  for (let a = 0; a < 360; a += TICK_STEP_DEG) {
    mount.append(radialLine(R.tickInner, R.tickOuter, a, 'dial__tick'));
  }

  for (let a = 0; a < 360; a += GOLD_MINOR_STEP_DEG) {
    if (a % GOLD_MAJOR_STEP_DEG === 0) continue;
    mount.append(
      radialLine(
        R.goldMinorInner,
        R.goldOuter,
        a,
        'dial__tick dial__tick--minor-gold',
      ),
    );
  }

  for (let a = 0; a < 360; a += GOLD_MAJOR_STEP_DEG) {
    mount.append(
      radialLine(
        R.goldMajorInner,
        R.goldOuter,
        a,
        'dial__tick dial__tick--major',
      ),
    );
  }
}

/* -------------------------------------------------------------------- lens */

function buildLens(mount) {
  const size = R.lensClip * 2;
  const origin = { x: CENTRE.x - R.lensClip, y: CENTRE.y - R.lensClip };

  const image = svg('image', {
    x: origin.x,
    y: origin.y,
    width: size,
    height: size,
    preserveAspectRatio: 'xMidYMid slice',
    'clip-path': 'url(#lens)',
    class: 'dial__lens-image',
  });
  image.setAttribute('href', config.centerImage);
  // Alt text lives on the <a>/<svg> label for AT; keep a title for tooltips.
  const imageTitle = svg('title');
  imageTitle.textContent = config.centerAlt;
  image.append(imageTitle);

  mount.append(
    svg('circle', {
      cx: CENTRE.x,
      cy: CENTRE.y,
      r: R.lensWell,
      class: 'dial__well',
    }),
    svg('circle', {
      cx: CENTRE.x,
      cy: CENTRE.y,
      r: R.lensWell,
      class: 'dial__case-inner',
      'stroke-width': 2,
    }),
    image,
    svg('rect', {
      x: origin.x,
      y: origin.y,
      width: size,
      height: size,
      'clip-path': 'url(#lens)',
      class: 'dial__lens-vignette',
    }),
    svg('circle', {
      cx: CENTRE.x,
      cy: CENTRE.y,
      r: R.lensBright,
      fill: 'none',
      class: 'dial__lens-bright',
    }),
    svg('circle', {
      cx: CENTRE.x,
      cy: CENTRE.y,
      r: R.lensShade,
      fill: 'none',
      class: 'dial__lens-shade',
    }),
  );
}

/* ---------------------------------------------------------------- segments */

/**
 * The artifacts the dial draws.
 *
 * `listed: false` takes a record off the dial without taking it out of the
 * config: it keeps its slug, #/p/<slug> still resolves on a cold load, and the
 * detail view renders it identically. Absent means listed, so a record that
 * belongs on the dial carries no flag.
 *
 * Filtered here, upstream of every layout function, rather than where the
 * markers are built. The title rows, the marker positions, and the busiest-lens
 * offset are all derived from this list by index, so skipping late would
 * reserve a row and a marker slot for something that is never drawn -- a gap in
 * the radial marker row and a blank line in the compact stack.
 */
const listedArtifacts = (segment) =>
  artifactsForSegment(config, segment).filter(
    (artifact) => artifact?.listed !== false,
  );

/**
 * Where each lens's label, its project titles, and its markers sit.
 *
 * Two layouts, chosen by place.stacked, because one shape cannot serve both
 * viewports. Radial puts each lens block on its mid-angle ray, which is the
 * composition the dial is for. Portrait cannot have it: reaching readable type
 * there needs about 30 viewBox units, and the longest title is then 429 units
 * wide against 285 units of margin beside the dial -- and shrinking the frame to
 * raise the scale only takes more margin away. So compact drops the radial
 * arrangement for the titles and lists the lenses down the empty space under the
 * dial, where a line has the full frame width to itself.
 *
 * Both layouts derive every line from the project counts rather than from what
 * is currently visible, so js/title-sweep.js can never move anything.
 */

/** One lens block placed on its mid-angle ray. */
function radialSpot(entry, place, maxCount) {
  const { segment, mid } = entry;
  const { frame } = place;
  const anchor = anchorFor(mid);
  const ray = polar(place.labelRadius, mid);

  const artifacts = listedArtifacts(segment);
  const count = artifacts.length;

  const labelWidth = estimateTextWidth(
    segment.label,
    place.labelSize,
    place.labelTracking,
    true,
  );
  // The titles share the label's x and anchor, so the block is as wide as its
  // widest line whether or not that line is currently visible.
  const titleWidths = artifacts.map((artifact) =>
    estimateTextWidth(
      artifact.name || '',
      place.markerLabelSize,
      TITLE_TRACKING,
      false,
    ),
  );
  const boxWidth = Math.max(labelWidth, ...titleWidths, 0);

  const x = round(clampAnchoredX(ray.x, boxWidth, anchor, frame));

  const top = frame.y + FRAME_INSET;
  const bottom = frame.y + frame.height - FRAME_INSET;

  // The marker row is offset by the busiest lens's line count, not this lens's,
  // so all four rows sit at the same distance below their label instead of the
  // one-project lens riding a line higher than its neighbours.
  const titleBlock =
    place.titleOffset + Math.max(0, maxCount - 1) * place.titleLeading;
  const blockHeight = titleBlock + place.markerGap + place.markerRadius;
  const y = round(clamp(ray.y, top + place.labelSize, bottom - blockHeight));

  const titleYs = artifacts.map((_, i) =>
    round(y + place.titleOffset + i * place.titleLeading),
  );

  // y is already clamped so the whole block fits; this clamp is only a guard
  // against a pathological frame.
  const markerY = round(
    clamp(
      y + titleBlock + place.markerGap,
      top + place.markerRadius,
      bottom - place.markerRadius,
    ),
  );

  const rowWidth = Math.max(0, count - 1) * place.markerPitch;
  let firstX;
  if (anchor === 'start') firstX = x + place.markerRadius;
  else if (anchor === 'end') firstX = x - place.markerRadius - rowWidth;
  else firstX = x - rowWidth / 2;

  // Keep the whole row in frame without disturbing the label.
  firstX = round(
    clamp(
      firstX,
      frame.x + FRAME_INSET + place.markerRadius,
      frame.x + frame.width - FRAME_INSET - place.markerRadius - rowWidth,
    ),
  );

  return {
    anchor,
    x,
    y,
    titleX: x,
    titleAnchor: anchor,
    titleYs,
    markerPos: artifacts.map((_, i) => ({
      cx: round(firstX + i * place.markerPitch),
      cy: markerY,
    })),
  };
}

/**
 * All lens blocks as a list under the dial, each row a marker beside its title.
 *
 * Sequential rather than independent, so it is computed for the whole layout at
 * once: each block starts where the previous one ended. Putting the marker
 * beside its own title also settles who owns which name, which a stack of titles
 * over a row of markers leaves to inference.
 */
function stackedSpots(layout, place) {
  const { frame } = place;
  const left = round(frame.x + FRAME_INSET);
  const titleX = round(left + place.markerRadius * 2 + place.markerTitleGap);

  let cursor = place.stackTop;
  return layout.map((entry) => {
    const artifacts = listedArtifacts(entry.segment);
    const rowTop = cursor + place.titleOffset;

    const titleYs = artifacts.map((_, i) =>
      round(rowTop + i * place.titleLeading),
    );
    const spot = {
      anchor: 'start',
      x: left,
      y: round(cursor),
      titleX,
      titleAnchor: 'start',
      titleYs,
      /*
       * A target per row, spanning the full text column rather than just the
       * marker. A 13-unit hexagon is about 17 rendered pixels on a phone, which
       * is not something to ask a thumb to find. Sized from titleLeading so the
       * rows tile exactly, touching without overlapping, and offset up from the
       * baseline so the type sits inside rather than on the edge.
       */
      hits: titleYs.map((titleY) => ({
        x: left,
        y: round(titleY - place.titleLeading * 0.72),
        width: round(frame.x + frame.width - FRAME_INSET - left),
        height: place.titleLeading,
      })),
      // Nudged off the text baseline so the hexagon reads as centred on the
      // line rather than sitting on it.
      markerPos: titleYs.map((titleY) => ({
        cx: round(left + place.markerRadius),
        cy: round(titleY - place.markerLabelSize * 0.34),
      })),
    };

    // Advance by the reserved lines, never by however many are visible. One
    // line minimum so an empty lens still takes up its label.
    cursor =
      rowTop +
      Math.max(1, artifacts.length) * place.titleLeading +
      place.blockGap;
    return spot;
  });
}

/** Placements for every lens, in layout order. */
function computePlacements(layout, place) {
  if (place.stacked) return stackedSpots(layout, place);
  const maxCount = layout.reduce(
    (most, entry) => Math.max(most, listedArtifacts(entry.segment).length),
    0,
  );
  return layout.map((entry) => radialSpot(entry, place, maxCount));
}

function buildSegmentLink(entry, place, spot) {
  const { segment, start, end } = entry;

  const link = svg('a', {
    class: 'seg',
    id: `seg-${segment.id}`,
    href: segment.href,
    tabindex: 0,
    'aria-label': segment.label,
  });
  if (isExternal(segment.href || '')) {
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noopener noreferrer');
  }

  // Config-supplied colour enters as a custom property; CSS does the painting.
  if (segment.color) link.style.setProperty('--seg-color', segment.color);
  if (segment.bevelColor)
    link.style.setProperty('--seg-bevel', segment.bevelColor);

  const title = svg('title');
  title.textContent = segment.label;
  link.append(title);

  const band = arcPath(R.band, start, end);
  link.append(
    svg('path', { d: band, class: 'seg__shadow', transform: 'translate(0,5)' }),
    svg('path', { d: band, class: 'seg__bevel' }),
    svg('path', { d: band, class: 'seg__band' }),
    svg('path', {
      d: arcPath(R.highlight, start, end),
      class: 'seg__highlight',
    }),
    svg('path', { d: arcPath(R.focusRing, start, end), class: 'seg__ring' }),
  );

  const { anchor, x, y } = spot;

  const label = svg('text', {
    x,
    y,
    'text-anchor': anchor,
    class: 'seg__label',
  });
  label.textContent = segment.label;

  link.append(label);
  return link;
}

function buildArtifactLinks(entry, place, spot) {
  const { segment } = entry;
  const artifacts = listedArtifacts(segment);
  if (artifacts.length === 0) return [];

  return artifacts.map((artifact, i) => {
    const { cx, cy } = spot.markerPos[i];
    const hit = spot.hits ? spot.hits[i] : null;

    // Markers point at the addressable detail view, not at the long-form page.
    // artifact.href is the write-up, which the detail view offers as a link
    // out; only a record with no slug falls back to pointing straight at it.
    const href = artifact.slug ? hashForSlug(artifact.slug) : artifact.href;

    const link = svg('a', {
      class: 'hex',
      href,
      tabindex: 0,
      'data-slug': artifact.slug || null,
      'data-lens': segment.id,
      'aria-label': `${artifact.name} — ${segment.label}`,
    });
    if (isExternal(href)) {
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');
    }
    if (segment.color) link.style.setProperty('--seg-color', segment.color);
    if (segment.bevelColor)
      link.style.setProperty('--seg-bevel', segment.bevelColor);

    const title = svg('title');
    title.textContent = artifact.name;
    link.append(title);

    // First, so it sits under the marker it extends rather than over it.
    if (hit) link.append(svg('rect', { ...hit, class: 'hex__hit' }));

    link.append(
      svg('polygon', {
        points: hexPoints(cx, cy, place.markerRadius),
        class: 'hex__body',
      }),
      svg('polygon', {
        points: hexPoints(
          cx,
          cy,
          place.markerRadius + place.markerRadius * 0.36,
        ),
        class: 'hex__ring',
      }),
    );

    // The title sits on its reserved line in the lens's block. It stays inside
    // this <a> so the hover and focus rules in styles/landing.css keep applying
    // to it untouched.
    const label = svg('text', {
      x: spot.titleX,
      y: spot.titleYs[i],
      'text-anchor': spot.titleAnchor,
      class: 'hex__label',
    });
    label.textContent = artifact.name;
    link.append(label);

    return link;
  });
}

/* ---------------------------------------------------------------- assembly */

function render(root, compact) {
  const place = compact ? PLACEMENT.compact : PLACEMENT.wide;
  const { frame } = place;

  root.classList.toggle('dial--compact', compact);
  root.setAttribute(
    'viewBox',
    `${frame.x} ${frame.y} ${frame.width} ${frame.height}`,
  );

  // Type sizes live in PLACEMENT only. Publishing them as custom properties
  // keeps the stylesheet and the label-width clamping reading the same numbers,
  // so the two cannot drift apart.
  root.style.setProperty('--label-size', `${place.labelSize}px`);
  root.style.setProperty('--label-tracking', `${place.labelTracking}px`);
  root.style.setProperty('--marker-label-size', `${place.markerLabelSize}px`);

  const mounts = {
    backdrop: root.querySelector('#dial-backdrop'),
    case: root.querySelector('#dial-case'),
    lens: root.querySelector('#dial-lens'),
    segments: root.querySelector('#dial-segments'),
  };
  for (const mount of Object.values(mounts)) mount.replaceChildren();

  const segments = Array.isArray(config.segments) ? config.segments : [];
  const layout = computeLayout(segments);

  buildBackdrop(mounts.backdrop);
  buildCase(mounts.case, layout);
  buildLens(mounts.lens);

  // Each segment is followed by its own artifact markers, so tab order runs
  // segment, its artifacts, next segment, rather than all arcs then all hexes.
  // Collected in the same pass, which makes the returned list clockwise from
  // twelve by construction: lens order, and project order within a lens.
  const spots = computePlacements(layout, place);
  const markers = [];
  for (const [i, entry] of layout.entries()) {
    const spot = spots[i];
    mounts.segments.append(buildSegmentLink(entry, place, spot));
    for (const marker of buildArtifactLinks(entry, place, spot)) {
      mounts.segments.append(marker);
      markers.push(marker);
    }
  }
  return markers;
}

/* ------------------------------------------------------ detail view wiring */

/**
 * Connects the dial to the addressable detail view.
 *
 * The dial opens nothing itself. Every marker is an ordinary link to
 * #/p/<slug>, so the browser owns the navigation and Back and Forward work
 * without help. The router only reports what the fragment currently says, and
 * the overlay does as it is told. That is why a cold load on a project URL
 * behaves identically to a click on its marker.
 */
function initProjectDetail(root) {
  const index = buildIndex(config);
  if (index.projects.length === 0) return null;

  // Resolved by slug on demand rather than captured when the card opens: a
  // breakpoint flip re-renders every marker, so the element that was clicked
  // can easily be detached by the time focus needs to return to it. Compared by
  // attribute rather than by selector so an odd slug needs no escaping.
  const markerFor = (slug) =>
    Array.from(root.querySelectorAll('.hex')).find(
      (hex) => hex.getAttribute('data-slug') === slug,
    ) || null;

  const overlay = createProjectOverlay({
    onRequestClose: () => router.close(),
  });

  const router = createProjectRouter({
    index,
    onOpen: (project) => {
      overlay.open(renderProjectDetail(project, { placeholders: false }), () =>
        markerFor(project.slug),
      );
    },
    onClose: () => overlay.close(),
    onMissing: (slug) => {
      // Nothing to show and nothing to tear down; the dial is already on screen
      // and stays usable. The bad fragment is left in the address bar on
      // purpose, so a mistyped URL is visible rather than silently rewritten.
      console.warn(`[projects] no project for slug "${slug}".`);
      overlay.close();
    },
  });

  router.start();
  return router;
}

/* ---------------------------------------------------------- title reveal */

let titleSweep = null;
let projectRouter = null;
/** True once the titles have been revealed, however that happened. */
let titlesRevealed = false;

/**
 * Point the sweep at the markers that are currently in the document.
 *
 * Called after every render, because a breakpoint flip replaces every marker and
 * the old element references go stale. The lap only ever runs once: a re-render
 * after the titles are up settles the new markers instead of replaying the
 * demo, which would be motion the visitor did not ask for twice.
 */
function syncTitles(root, markers) {
  if (titleSweep) titleSweep.stop();
  titleSweep = createTitleSweep({ root, hexes: markers });

  // A detail view already on screen means the visitor arrived aimed at one
  // project. There is nothing to demonstrate, and animating behind the modal
  // would be motion they cannot even see.
  const detailOpen = projectRouter ? projectRouter.current() !== null : false;

  if (titlesRevealed || detailOpen) {
    titleSweep.settle();
  } else {
    titleSweep.start();
  }
  titlesRevealed = true;
}

function init() {
  const root = document.getElementById('dial');
  if (!root) return;

  const media = window.matchMedia(COMPACT_QUERY);
  let markers = render(root, media.matches);

  // Only re-render when the breakpoint actually flips; nothing else depends on
  // pixel size, and re-rendering would otherwise drop focus on every resize.
  const onChange = (event) => {
    markers = render(root, event.matches);
    syncTitles(root, markers);
  };
  if (typeof media.addEventListener === 'function') {
    media.addEventListener('change', onChange);
  } else {
    media.addListener(onChange);
  }

  // The router runs first so that a cold load on #/p/<slug> has already opened
  // its detail view by the time the titles decide whether to sweep.
  projectRouter = initProjectDetail(root);
  syncTitles(root, markers);
}

init();
