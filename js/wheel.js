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
 */

import config from '../data/site.config.js';

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
 * Label and marker placement. Compact pulls the label ring in and trades up in
 * type size (styles/landing.css bumps the matching font-size under
 * .dial--compact) so the dial stays readable when the SVG is scaled down.
 */
const PLACEMENT = {
  wide: {
    frame: FULL_FRAME,
    labelRadius: 300,
    labelSize: 13.5,
    labelTracking: 3.4,
    subtitleSize: 10.5,
    subtitleTracking: 0.8,
    subtitleOffset: 22,
    markerOffset: 30,
    markerRadius: 14,
    markerPitch: 32,
    markerLabelSize: 9.5,
  },
  // Compact keeps the radial composition but trades type size down so nothing
  // overlaps the dial. See the note in README-less form: portrait cannot fit
  // readable type beside a 400-unit dial, so this is legible-ish, not legible.
  compact: {
    frame: FULL_FRAME,
    labelRadius: 300,
    labelSize: 20,
    labelTracking: 3.6,
    subtitleSize: 13,
    subtitleTracking: 0.8,
    subtitleOffset: 26,
    markerOffset: 34,
    markerRadius: 18,
    markerPitch: 42,
    markerLabelSize: 12,
  },
};

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

const isExternal = (href) => /^[a-z][a-z0-9+.-]*:/i.test(href) && !href.startsWith('#');

/* ------------------------------------------------------------------- layout */

/**
 * Derive each segment's arc from its weight. Gaps straddle the boundaries so
 * one gap is centred on 12 o'clock regardless of segment count.
 */
function computeLayout(segments) {
  const weights = segments.map((s) => (Number(s.weight) > 0 ? Number(s.weight) : 0));
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  const available = 360 - segments.length * GAP_DEG;

  // Degenerate configs (no segments, or all weights zero) fall back to equal shares.
  const share = (i) =>
    totalWeight > 0 ? weights[i] / totalWeight : 1 / Math.max(1, segments.length);

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
      svg('rect', { x: -8, y: -6.5, width: 16, height: 13, class: 'dial__tab-body' }),
      svg('rect', { x: -2.5, y: -2, width: 5, height: 4, class: 'dial__tab-slot' }),
    );
    mount.append(tab);
  }

  mount.append(
    svg('circle', { cx: CENTRE.x, cy: CENTRE.y, r: R.caseRing, class: 'dial__case' }),
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
      radialLine(R.goldMinorInner, R.goldOuter, a, 'dial__tick dial__tick--minor-gold'),
    );
  }

  for (let a = 0; a < 360; a += GOLD_MAJOR_STEP_DEG) {
    mount.append(
      radialLine(R.goldMajorInner, R.goldOuter, a, 'dial__tick dial__tick--major'),
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
    svg('circle', { cx: CENTRE.x, cy: CENTRE.y, r: R.lensWell, class: 'dial__well' }),
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
 * Where a segment's label block and marker row sit. Both derive from the
 * segment's mid-angle: the label block is placed on the mid-angle ray, and the
 * marker row hangs off the label block rather than getting its own radius. That
 * way the two can never overlap however the weights, the label lengths, or the
 * frame clamping fall out.
 */
function computePlacement(entry, place) {
  const { segment, mid } = entry;
  const { frame } = place;
  const anchor = anchorFor(mid);
  const ray = polar(place.labelRadius, mid);

  const labelWidth = estimateTextWidth(
    segment.label,
    place.labelSize,
    place.labelTracking,
    true,
  );
  const subtitleWidth = estimateTextWidth(
    segment.subtitle,
    place.subtitleSize,
    place.subtitleTracking,
    false,
  );
  const boxWidth = Math.max(labelWidth, subtitleWidth);

  const x = round(clampAnchoredX(ray.x, boxWidth, anchor, frame));

  const top = frame.y + FRAME_INSET;
  const bottom = frame.y + frame.height - FRAME_INSET;

  // Reserve room for the label, the subtitle under it, and the marker row.
  const blockHeight = place.subtitleOffset + place.markerOffset + place.markerRadius;
  const y = round(clamp(ray.y, top + place.labelSize, bottom - blockHeight));
  const subtitleY = round(y + place.subtitleOffset);

  // Markers sit under the subtitle, or above the label if there is no room below.
  const belowY = subtitleY + place.markerOffset;
  const fitsBelow = belowY + place.markerRadius <= bottom;
  const markerY = round(
    fitsBelow
      ? belowY
      : Math.max(top + place.markerRadius, y - place.labelSize - place.markerOffset),
  );

  const count = (segment.artifacts || []).length;
  const rowWidth = Math.max(0, count - 1) * place.markerPitch;
  let firstX;
  if (anchor === 'start') firstX = x + place.markerRadius;
  else if (anchor === 'end') firstX = x - place.markerRadius - rowWidth;
  else firstX = x - rowWidth / 2;

  // Keep the whole row in frame without disturbing the label.
  firstX = clamp(
    firstX,
    frame.x + FRAME_INSET + place.markerRadius,
    frame.x + frame.width - FRAME_INSET - place.markerRadius - rowWidth,
  );

  return { anchor, x, y, subtitleY, markerY, firstX: round(firstX) };
}

function buildSegmentLink(entry, place, spot) {
  const { segment, start, end } = entry;

  const link = svg('a', {
    class: 'seg',
    id: `seg-${segment.id}`,
    href: segment.href || 'projects.html',
    tabindex: 0,
    'aria-label': `${segment.label}. ${segment.subtitle}`,
  });
  if (isExternal(segment.href || '')) {
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noopener noreferrer');
  }

  // Config-supplied colour enters as a custom property; CSS does the painting.
  if (segment.color) link.style.setProperty('--seg-color', segment.color);
  if (segment.bevelColor) link.style.setProperty('--seg-bevel', segment.bevelColor);

  const title = svg('title');
  title.textContent = `${segment.label} — ${segment.subtitle}`;
  link.append(title);

  const band = arcPath(R.band, start, end);
  link.append(
    svg('path', { d: band, class: 'seg__shadow', transform: 'translate(0,5)' }),
    svg('path', { d: band, class: 'seg__bevel' }),
    svg('path', { d: band, class: 'seg__band' }),
    svg('path', { d: arcPath(R.highlight, start, end), class: 'seg__highlight' }),
    svg('path', { d: arcPath(R.focusRing, start, end), class: 'seg__ring' }),
  );

  const { anchor, x, y, subtitleY } = spot;

  const label = svg('text', { x, y, 'text-anchor': anchor, class: 'seg__label' });
  label.textContent = segment.label;

  const subtitle = svg('text', {
    x,
    y: subtitleY,
    'text-anchor': anchor,
    class: 'seg__subtitle',
  });
  subtitle.textContent = segment.subtitle;

  link.append(label, subtitle);
  return link;
}

function buildArtifactLinks(entry, place, spot) {
  const { segment, mid } = entry;
  const artifacts = segment.artifacts || [];
  if (artifacts.length === 0) return [];

  // A horizontal row of hexes hanging off the segment's label block.
  const centreY = spot.markerY;

  return artifacts.map((artifact, i) => {
    const cx = spot.firstX + i * place.markerPitch;

    const link = svg('a', {
      class: 'hex',
      href: artifact.href,
      tabindex: 0,
      'aria-label': `${artifact.name} — ${segment.label}`,
    });
    if (isExternal(artifact.href)) {
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');
    }
    if (segment.color) link.style.setProperty('--seg-color', segment.color);
    if (segment.bevelColor) link.style.setProperty('--seg-bevel', segment.bevelColor);

    const title = svg('title');
    title.textContent = artifact.name;
    link.append(title);

    link.append(
      svg('polygon', {
        points: hexPoints(cx, centreY, place.markerRadius),
        class: 'hex__body',
      }),
      svg('polygon', {
        points: hexPoints(cx, centreY, place.markerRadius + place.markerRadius * 0.36),
        class: 'hex__ring',
      }),
    );

    const labelAnchor = anchorFor(mid);
    const labelWidth = estimateTextWidth(artifact.name, place.markerLabelSize, 0.6, false);
    const label = svg('text', {
      x: round(clampAnchoredX(cx, labelWidth, labelAnchor, place.frame)),
      y: round(centreY + place.markerRadius + place.markerLabelSize * 1.5),
      'text-anchor': labelAnchor,
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
  root.setAttribute('viewBox', `${frame.x} ${frame.y} ${frame.width} ${frame.height}`);

  // Type sizes live in PLACEMENT only. Publishing them as custom properties
  // keeps the stylesheet and the label-width clamping reading the same numbers,
  // so the two cannot drift apart.
  root.style.setProperty('--label-size', `${place.labelSize}px`);
  root.style.setProperty('--label-tracking', `${place.labelTracking}px`);
  root.style.setProperty('--subtitle-size', `${place.subtitleSize}px`);
  root.style.setProperty('--subtitle-tracking', `${place.subtitleTracking}px`);
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
  for (const entry of layout) {
    const spot = computePlacement(entry, place);
    mounts.segments.append(buildSegmentLink(entry, place, spot));
    for (const marker of buildArtifactLinks(entry, place, spot)) {
      mounts.segments.append(marker);
    }
  }
}

function init() {
  const root = document.getElementById('dial');
  if (!root) return;

  const media = window.matchMedia(COMPACT_QUERY);
  render(root, media.matches);

  // Only re-render when the breakpoint actually flips; nothing else depends on
  // pixel size, and re-rendering would otherwise drop focus on every resize.
  const onChange = (event) => render(root, event.matches);
  if (typeof media.addEventListener === 'function') {
    media.addEventListener('change', onChange);
  } else {
    media.addListener(onChange);
  }
}

init();
