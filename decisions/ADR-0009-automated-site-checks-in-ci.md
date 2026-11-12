# ADR-0009 — Run automated site checks in CI on every pull request

## Context

Commit `4b5a798` deleted the `--case-light` token from `styles/landing.css`.
Nothing failed. `--seg-bevel` falls back to `var(--case-light)`, so Craft, the
one lens with no `bevelColor`, drew its hover wire with `stroke: none`. The
modal's focus ring and a gradient stop on the dial case lost their colour the
same way. It was found by hovering Craft by hand.

An undefined custom property is invalid at computed-value time, so the browser
quietly uses the property's initial value and reports nothing. Merging to
`master` deploys straight to the live site with no staging, so the first visitor
is the first tester. Verification so far has been by hand (ADR-0002), and it
lives in the conversation that did it rather than in the repo.

A move to statically generated pages is planned. A refactor of that size needs
something to stand on that already passes before it starts.

## Decision

Three checks, run by `.github/workflows/checks.yml` on every pull request into
`master` and on `master` itself:

1. **`tests/lint-css-vars.mjs`**: fails on any `var(--x)` with no fallback that
   nothing defines. Definitions come from the stylesheets an HTML entry point
   links, from `setProperty('--x', …)` in `js/`, and from inline styles.
2. **`tests/check-links.mjs`**: fails on any local `href`, `src`, `content`, or
   CSS `url()` that points at a missing file, and on any `#/<slug>` with no
   record. It reads the page, `site.config.js`, and each content file.
3. **`tests/smoke.spec.mjs`** (Playwright): loads the landing page in both
   layouts, hovers every lens and asserts its nodes light with a visible wire,
   checks the featured lens, and cold-loads every `#/<slug>` to assert the
   modal opens, its case study renders where one is configured, its images
   load, and Escape closes it. Any console warning or error fails the test.

The first two are plain Node with no dependencies. They run first, so the
common breakages fail in seconds. The smoke suite reads projects and lenses
from `site.config.js`, so new content is covered without editing tests.

Each check was confirmed to fail on the breakage that motivated it: the lint
and the smoke suite both fail with `--case-light` removed, and the link checker
fails on a `content` path that does not exist.

## Alternatives rejected

- **Pixel-diff screenshots.** ADR-0002 measured Chromium's gradient
  rasterisation drifting between sessions with zero CSS change, so a pixel
  diff cannot tell a regression from noise on this site.
- **The computed-style digest from ADR-0002, run in CI.** It proves a refactor
  changed nothing, which is the wrong question for ordinary pull requests that
  are supposed to change things. It stays a tool for refactors, to be added
  when the static-generation work needs it.
- **Checking external links.** Whether a third-party site is up is not
  something a pull request can fix, and CI would flake on it.
- **A stylelint or ESLint setup.** More dependencies and configuration to catch
  a wider class of issues than the ones that have actually bitten. The custom
  lint is about 80 lines and targets the real failure.

## Consequences

- The repo gains a `package.json` and one dev dependency, `@playwright/test`,
  pinned to an exact version. AGENTS.md's "no new dependencies" rule is about
  what the site ships, and this does not change that: nothing under
  `node_modules` is committed or served, and the site still has no build step.
- Locally, `npm ci` then `npm run check` runs everything. Set `CHROME_PATH` to
  use an installed Chrome instead of downloading Playwright's.
- The smoke suite emulates reduced motion, per ADR-0002, so the opening title
  sweep's motion is still verified only by eye.
- Branch protection on `master` requiring the `checks` job is not set here. That
  is a repository setting for the owner to turn on.
