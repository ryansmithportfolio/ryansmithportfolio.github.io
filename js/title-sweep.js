/**
 * The opening sweep: reveals each project title once, in wheel order, then
 * leaves them all up.
 *
 * The problem it solves is that the markers say nothing at rest. A visitor has
 * no reason to believe a hexagon is a link, and on a touch screen the hover
 * reveal is unreachable, so the titles may as well not exist. One lap around
 * the dial demonstrates that every marker carries a name, and then gets out of
 * the way.
 *
 * Shape of the thing: a list and a cursor. Each beat hides the outgoing title
 * and shows the incoming one in the same tick, and the CSS transition on
 * .hex__label turns that into a crossfade -- the two pass through half opacity
 * together, so exactly one title is ever at full strength. Because it walks
 * projects rather than lens regions, an uneven number of projects per lens
 * cannot make the rhythm stumble; Craft's single project is one beat like any
 * other.
 *
 * Opacity is driven through the --label-opacity custom property rather than by
 * writing to style.opacity. That matters: an inline opacity would outrank the
 * .hex:hover rule in styles/landing.css and permanently break the hover reveal,
 * whereas a custom property leaves the hover rule the winner it always was.
 *
 * The sweep is a courtesy, never an obstacle. Any sign that the visitor is
 * doing something -- hovering, clicking, tabbing, typing -- ends it immediately
 * by settling, and so does the tab going away. Every one of those exits leaves
 * all titles visible. There is no path through this module that leaves a title
 * hidden.
 */

/** Milliseconds a title holds before the next one starts. Every beat is equal. */
const DWELL_MS = 280;

/**
 * Crossfade length. Half the dwell, so the outgoing title is still going as the
 * incoming one arrives, and both sit at half opacity in the middle of the
 * handover rather than either reaching full alone.
 */
const FADE_MS = 140;

/**
 * Anything here means the visitor is engaged and does not need the demo.
 * pointerover rather than pointermove: it fires on entering an element, which is
 * what hovering actually is, instead of on every pixel of travel.
 */
const INTERRUPT_EVENTS = [
  'pointerover',
  'pointerdown',
  'touchstart',
  'click',
  'keydown',
  'focusin',
  'wheel',
];

const prefersReducedMotion = () =>
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * @param {object} deps
 * @param {SVGElement} deps.root the dial, which carries --label-fade
 * @param {Element[]} deps.hexes marker links in wheel order
 * @param {number} [deps.dwell]
 * @param {number} [deps.fade]
 * @returns {{ start(): void, settle(): void, stop(): void, state(): string }}
 */
export function createTitleSweep({ root, hexes, dwell = DWELL_MS, fade = FADE_MS }) {
  const markers = Array.from(hexes || []);

  /** 'idle' before anything, 'sweeping' mid-lap, 'settled' once all are up. */
  let state = 'idle';
  let cursor = 0;
  let timer = 0;
  let armed = false;

  const show = (marker, on) =>
    marker.style.setProperty('--label-opacity', on ? '1' : '0');

  function clearTimer() {
    if (!timer) return;
    window.clearTimeout(timer);
    timer = 0;
  }

  function onInterrupt() {
    // A skip-ahead, not an opt-out: the visitor gets the end state at once.
    settle();
  }

  function onVisibilityChange() {
    // Leaving the sweep parked mid-lap behind a hidden tab would mean coming
    // back to one title lit and six dark, which reads as a bug.
    if (document.hidden) settle();
  }

  function arm() {
    if (armed) return;
    for (const type of INTERRUPT_EVENTS) {
      document.addEventListener(type, onInterrupt, { capture: true, passive: true });
    }
    document.addEventListener('visibilitychange', onVisibilityChange);
    armed = true;
  }

  function disarm() {
    if (!armed) return;
    for (const type of INTERRUPT_EVENTS) {
      document.removeEventListener(type, onInterrupt, { capture: true });
    }
    document.removeEventListener('visibilitychange', onVisibilityChange);
    armed = false;
  }

  function beat() {
    if (state !== 'sweeping') return;

    if (cursor > 0) show(markers[cursor - 1], false);
    show(markers[cursor], true);
    cursor += 1;

    // The last title gets the same dwell as the rest before settling, so the
    // seventh beat is not visibly shorter than the sixth.
    timer = window.setTimeout(cursor >= markers.length ? settle : beat, dwell);
  }

  /**
   * Bring every title up and leave it there.
   *
   * Independent of the sweep on purpose: it assumes nothing about how many beats
   * ran, or whether any did, so it is equally correct as the reduced-motion
   * path, as an interrupt, and as the sweep's own ending. This is the extension
   * point -- anything that belongs in the resting state belongs here.
   */
  function settle() {
    clearTimer();
    disarm();
    state = 'settled';
    for (const marker of markers) show(marker, true);
    // Hand the fade length back to the stylesheet so hover regains its own feel.
    root.style.removeProperty('--label-fade');
  }

  /**
   * Halt without revealing anything. This is teardown, not a user-facing exit --
   * the caller re-renders and then decides between start() and settle(). Nothing
   * a visitor can do reaches this; their interruptions all settle instead.
   */
  function stop() {
    clearTimer();
    disarm();
    if (state === 'sweeping') state = 'idle';
  }

  function start() {
    if (state !== 'idle' || markers.length === 0) return;

    // Reduced motion gets the destination and no journey.
    if (prefersReducedMotion()) {
      settle();
      return;
    }

    state = 'sweeping';
    cursor = 0;
    root.style.setProperty('--label-fade', `${fade}ms`);
    for (const marker of markers) show(marker, false);
    arm();
    beat();
  }

  return { start, settle, stop, state: () => state };
}

export default createTitleSweep;
