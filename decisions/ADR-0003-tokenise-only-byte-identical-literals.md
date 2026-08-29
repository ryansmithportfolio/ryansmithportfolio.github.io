# ADR-0003 — Promote a literal to a custom property only when the repeats are byte-identical

## Context

The deduplication pass had to decide which repeated literal values become custom
properties. The candidates were not equivalent in kind, and the largest one was
also the most invasive.

Counted in `styles/styles.css`:

- `rgba(15, 23, 42, …)` — the slate channel triple, hand-written **23 times**
  across 15 different alpha values
- `'Major Mono Display', monospace` — 9 times, byte-identical
- `0.3s ease` — 4 times, all modal-scoped
- `'Inter', sans-serif` — 3 times, byte-identical
- `#ffffff` — 5 times, alongside 2 separate `#fff`

And in `styles/landing.css`, `180ms` 9 times, `clamp(1.5rem, 6vw, 3.75rem)` 3
times, `1.75rem` 7 times.

A standing constraint on the branch was that equivalent values must not be
rewritten — no `#ffffff` to `#fff`, no `0.5s` to `500ms` — because such rewrites
render identically and bury the real diff in noise.

The 23 slate triples collide with that constraint directly. Fifteen distinct
alphas cannot share one token without either a channel-list token consumed as
`rgb(var(--slate) / 0.85)`, which is a syntax rewrite of every one of the 23
sites, or fifteen alpha-specific tokens, which is more names than the duplication
it removes.

## Decision

Promote a literal only when its repeats are already byte-identical strings, so
the change is pure substitution.

Added: `--font-mono` (9 sites), `--font-sans` (3), `--surface-light` (5),
`--modal-timing` (4), `--gutter-page` (3), `--reveal-duration` (7).

Two corollaries that decided the remaining cases:

- **A repeated number is not automatically a concept.** `1.75rem` appears 7 times
  as a nav gap, a panel padding floor, the upper bound of a font-size `clamp`, a
  links gap, a margin, and a compact padding. Those roles are unrelated; one
  token would assert a relationship that does not exist and would couple them
  under future edits. Left as literals.
- **Cross-cutting identical declarations on unrelated components become tokens,
  not shared selector lists.** `text-transform: uppercase` appears on five
  components spanning 490 lines of `landing.css`. Merging them into one selector
  list would couple a nav link to a dial label to a detail subtitle. Selector-list
  consolidation was therefore confined to genuinely related groups — the five
  band layers, the three bevel-stroked reveal layers, the paired hover/focus
  reveals.

One literal is deliberately preserved: `landing.css`'s
`transition: opacity var(--label-fade, 180ms) ease` on `.hex__label`. That
fallback is a contract with `js/title-sweep.js`, which writes `--label-fade`
during the opening lap and removes it on settle. The exception is documented at
the token definition.

## Alternatives rejected

**A channel-list token plus `rgb(var(--slate) / <alpha>)`.** The largest single
win available — 23 sites to one definition. Rejected because it rewrites the
syntax of every site, which the no-equivalent-value-rewrite constraint exists to
prevent: a 23-site syntax churn in the same commit as cascade consolidation makes
the substantive change unreviewable. Deferred to its own branch, where the
rewrite is the reviewable subject rather than noise around it.

**Fifteen alpha-specific slate tokens** (`--slate-06`, `--slate-18`, …).
Rejected: it trades 23 literals for 15 names carrying no more meaning than the
numbers they replace, and a reader still cannot tell which to reach for.

**Unifying the near-duplicate durations.** `0.22s ease-out` on `.project` and
`0.18s ease-out` on `#back-to-top` do the same job at different speeds — almost
certainly drift rather than intent. Rejected because collapsing them changes a
rendered value, and whether that is a bug or a deliberate difference is not the
refactor's call. Reported instead.

**Tokenising `0.18s`/`0.22s` as they stand.** Rejected: all four occurrences of
each sit inside a single multi-property `transition` declaration, so a token adds
indirection without removing cross-rule duplication.

**Unifying `#fff` with `#ffffff`.** Rejected under the same constraint. The five
`#ffffff` sites became `--surface-light`; the two `#fff` remain literals, which
looks inconsistent and is the visible cost of the rule.

**`border-radius: 50%`, 6 sites.** Rejected: `50%` is a self-documenting shape
primitive, and `--radius-circle` is strictly less clear than the value.

## Consequences

Easier: every substitution in the pass is provably inert, which is what let the
whole change be verified as a single unit rather than argued rule by rule. The
new tokens follow the existing house pattern — role first, no type prefix on
colours, type suffix on non-colours — so they read as part of the same system.
Font-family and timing now have a single definition each, which is where drift
was most likely.

Harder: the file still contains 23 hand-written slate triples, so the largest
duplication is documented rather than fixed, and anyone adjusting the surface
palette must still edit 23 sites. Two colour spellings now coexist with a token
covering only one of them. And `--reveal-duration` covers 7 of the 8 `180ms`
sites in `landing.css`: changing the token leaves the `.hex__label` hover
fallback behind at its literal, which is a real drift hazard accepted in exchange
for not touching an unverifiable JS contract.
