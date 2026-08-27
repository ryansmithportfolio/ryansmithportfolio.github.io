/**
 * The modal shell that a project detail card is shown in.
 *
 * Everything here is mechanism, not content: the dialog semantics, the focus
 * move and return, the Escape key, the backdrop, the trap, the scroll lock. The
 * card itself arrives as a finished, detached element from
 * js/project-view.js and is simply appended.
 *
 * That split is the whole design. This file is the part you delete when the
 * detail view graduates to its own page; the renderer is the part you keep.
 *
 * The overlay never decides to close itself. Escape, the backdrop, and the close
 * button all call onRequestClose, which the caller routes through the hash
 * router, so the URL and what is on screen can never disagree.
 */

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

const SUPPORTS_INERT = 'inert' in HTMLElement.prototype;

/** The heading id that js/project-view.js generates for this prefix. */
const ID_PREFIX = 'project-detail';

function createShell() {
  const root = document.createElement('div');
  root.className = 'overlay';
  root.hidden = true;

  const backdrop = document.createElement('div');
  backdrop.className = 'overlay__backdrop';

  const panel = document.createElement('div');
  panel.className = 'overlay__panel';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-modal', 'true');
  panel.setAttribute('aria-labelledby', `${ID_PREFIX}-title`);
  // Programmatic focus target for the brief moment before the card is in place.
  panel.tabIndex = -1;

  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'overlay__close';
  close.setAttribute('aria-label', 'Close project detail');
  // A glyph, not an icon font: nothing external is loaded on this page.
  close.textContent = '×';

  const body = document.createElement('div');
  body.className = 'overlay__body';

  panel.append(close, body);
  root.append(backdrop, panel);

  return { root, backdrop, panel, close, body };
}

/**
 * @param {object} deps
 * @param {() => void} deps.onRequestClose called when the user asks to close.
 * @returns {{
 *   open(card: HTMLElement, opener?: Element | (() => Element | null)): void,
 *   close(): void,
 *   isOpen(): boolean,
 * }}
 */
export function createProjectOverlay({ onRequestClose }) {
  const shell = createShell();
  document.body.append(shell.root);

  let open = false;
  let restoring = false;
  /** Element or resolver for whatever had focus before we took it. */
  let opener = null;
  /** Siblings we made inert, so we only undo what we did. */
  let inerted = [];

  const request = () => {
    if (typeof onRequestClose === 'function') onRequestClose();
  };

  const focusables = () =>
    Array.from(shell.panel.querySelectorAll(FOCUSABLE)).filter(
      (node) => node.offsetParent !== null || node === shell.close,
    );

  function resolveOpener() {
    if (typeof opener === 'function') {
      try {
        return opener();
      } catch {
        return null;
      }
    }
    // A breakpoint flip re-renders the dial, so the element we were handed may
    // no longer be in the document. Only focus it if it still is.
    return opener && opener.isConnected ? opener : null;
  }

  function onKeyDown(event) {
    if (!open) return;

    if (event.key === 'Escape') {
      event.preventDefault();
      request();
      return;
    }

    if (event.key !== 'Tab') return;

    const items = focusables();
    if (items.length === 0) {
      event.preventDefault();
      shell.panel.focus();
      return;
    }

    const first = items[0];
    const last = items[items.length - 1];
    const active = document.activeElement;

    if (!shell.panel.contains(active)) {
      event.preventDefault();
      (event.shiftKey ? last : first).focus();
      return;
    }
    if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  }

  /**
   * Second line of defence behind the Tab handler, for focus that arrives some
   * other way -- a click on the page behind, or a browser that cycles focus
   * without a keydown we see.
   */
  function onFocusIn(event) {
    if (!open || restoring) return;
    if (shell.root.contains(event.target)) return;
    shell.panel.focus();
  }

  function applyInert() {
    if (!SUPPORTS_INERT) return;
    inerted = Array.from(document.body.children).filter(
      (child) => child !== shell.root && !child.inert,
    );
    for (const child of inerted) child.inert = true;
  }

  function releaseInert() {
    for (const child of inerted) child.inert = false;
    inerted = [];
  }

  shell.close.addEventListener('click', request);
  shell.backdrop.addEventListener('click', request);
  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('focusin', onFocusIn);

  return {
    open(card, nextOpener) {
      opener = nextOpener || document.activeElement;

      shell.body.replaceChildren(card);
      shell.root.hidden = false;
      document.body.classList.add('has-overlay');
      applyInert();
      open = true;

      // Paint hidden-to-visible across two frames so the CSS transition has a
      // starting value to move from. Under prefers-reduced-motion the
      // stylesheet zeroes the transition and this is simply a no-op.
      window.requestAnimationFrame(() => {
        if (open) shell.root.classList.add('is-open');
      });

      // Focus the panel rather than the close button: a screen reader then
      // announces the dialog and its title before offering the first control.
      shell.panel.focus();
      shell.panel.scrollTop = 0;
    },

    close() {
      if (!open) return;
      open = false;
      restoring = true;

      shell.root.classList.remove('is-open');
      shell.root.hidden = true;
      shell.body.replaceChildren();
      document.body.classList.remove('has-overlay');
      releaseInert();

      const target = resolveOpener();
      // Focus has to land somewhere. If the marker is gone, the document is a
      // better answer than a detached node.
      if (target && typeof target.focus === 'function') {
        target.focus();
      } else if (document.activeElement && shell.root.contains(document.activeElement)) {
        document.activeElement.blur();
      }

      opener = null;
      restoring = false;
    },

    isOpen() {
      return open;
    },
  };
}

export default createProjectOverlay;
