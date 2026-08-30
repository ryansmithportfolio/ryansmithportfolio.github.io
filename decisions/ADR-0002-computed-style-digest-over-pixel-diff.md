# ADR-0002 — Verify CSS refactors by computed-style digest, not pixel diff

## Context

A CSS deduplication pass had to prove it changed nothing visually. The stated
method was byte-identical before/after PNGs compared with `cmp -s`, on the
reasoning that identical rendering on the same machine and browser produces
identical files.

It does not, on this site. The landing page is built almost entirely from
`radial-gradient` layers, and Chromium drifts between rasterisation modes for
that region across a session. Measured, with the stylesheets reverted to
pristine and therefore **zero** CSS change in play:

```
CONTROL: pristine vs pristine (zero CSS change)
  FAIL  02-home-375.png   13819 px differ   max delta 8/255
```

The same comparison with the refactor applied differed _less_ — 2–3/255 across
8765 px. Two consecutive pristine runs were byte-identical, so the drift is
session-scoped rather than random per capture, which is why an early baseline
set captured on a cold renderer passed repeatedly and then began failing.

A 60x-amplified difference image showed uniform speckle confined to the gradient
disc, with zero difference in the masthead, footer, hex labels, or any text or
solid region. A real cascade change produces coherent structure — a shifted
edge, a ring, a band — not uniform noise across a gradient.

So the oracle could not distinguish a correct refactor from no change at all,
in either direction. Verification needed a different basis.

## Decision

Verify by hashing the **resolved computed style of every element plus its layout
box**, and compare digests before and after.

For each captured state, walk `document.querySelectorAll('*')`; for each element
serialise every property in `getComputedStyle` plus `getBoundingClientRect`, and
SHA-256 the result. Custom properties are excluded, because promoting a literal
to a new token is an intended difference.

The refactor was accepted on this basis: all 8 states identical, covering
1,578,892 resolved property values.

Screenshots are still captured, and `cmp` is still run and reported. It is
evidence, not the verdict.

Two supporting decisions in the same pass:

- **Verification covers `projects.html`, not just `/`.** The two stylesheets are
  fully partitioned — `index.html` loads only `landing.css`, `projects.html` only
  `styles.css`. Verifying `/` alone would have left every `styles.css` edit
  unproven. Coverage went from 5 states to 8, including one with the legacy modal
  open, since ~30 `.modal*` rules render only then.
- **Reduced motion is emulated for every capture** via
  `page.emulateMedia({ reducedMotion: 'reduce' })`, which makes
  `js/title-sweep.js` settle immediately. This is what keeps the settled state
  deterministic, and it is also why the sweep and the crossfades are outside
  what any of this verifies.

## Alternatives rejected

**`cmp` on full-viewport PNGs.** The stated method. Rejected on evidence: it
reported a failure with zero CSS change, so it cannot support the claim it was
meant to support. Keeping it as the verdict would have meant either reverting
correct work or explaining away failures case by case — and "the diff looks
harmless" is exactly the judgement a byte comparison exists to avoid.

**A pixel-tolerance threshold** (accept if max channel delta <= N). Rejected: it
weakens the guarantee in the one dimension that matters. A genuine one-shade
colour error and this renderer noise are both small deltas; a threshold tuned to
pass the noise would pass the error too.

**Masking the nondeterministic region.** Rejected once the cause was understood.
The drift is spread across the whole dial, which is the primary subject of the
page — masking it would exclude most of what needs verifying. (Masking _was_
warranted earlier for a different cause: `particles.js` seeded particle
positions from `Math.random()`, making that canvas unverifiable in principle.
Removing the dependency removed the need.)

**Re-baselining on a warm renderer and keeping `cmp`.** Tried. Two consecutive
pristine runs matched, so it looked sufficient, then drifted again after an
intervening workload. The mode is not stable enough to anchor a baseline to.

**Trusting review of the diff instead.** Rejected. Every edit in the pass was
individually argued safe on cascade grounds, and that reasoning is precisely
what needed independent checking.

## Consequences

Easier: the oracle is exact and machine-checkable, with no threshold to tune. It
localises better than pixels — a digest mismatch can be narrowed to the element
and property, whereas a pixel diff shows only where light changed. It is
unaffected by GPU, font rasterisation, driver, and machine differences, so it
gives the same verdict in CI as locally. It also catches changes pixels cannot
see at all: a computed value behind an occluding element, or a hover transition
duration in a settled screenshot.

Harder: it proves the _inputs_ to painting are identical, not the painted result.
A browser bug where identical computed styles paint differently would pass. It
cannot see anything absent from computed style or layout boxes — canvas contents,
image decoding, or paint order between overlapping siblings. Anything driven by
JS writing custom properties is excluded by the custom-property filter and needs
its own check.

Practically: the settled state is verified and the motion is not. The title
sweep and the overlay crossfade on `projects.html` remain
eye-checked, because the reduced-motion emulation that makes capture
deterministic is what removes them from view.
