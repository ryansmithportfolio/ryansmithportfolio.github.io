# AGENTS.md

Working agreement for AI agents in this repository.

## Repo

Personal portfolio. Static site on GitHub Pages at the domain root.
No build step, no framework, no bundler. Vanilla HTML, CSS, and ES modules.

`master` is production. Merging deploys straight to the live site with no
staging environment.

Serve locally with `python3 -m http.server 8000`. Opening `index.html` over
`file://` breaks ES modules and `fetch`, and the failure looks like a code bug.

## Architecture

Project content lives in `data/projects.json` and contains no presentation —
no colors, no coordinates, no HTML. Lens colors are CSS keyed off
`[data-lens="…"]`. Keep it that way.

## Scope

One change per branch.

If it isn't in the stated scope, don't implement it. When you notice work
that falls outside it, record it at the end of your response as a proposed
issue rather than doing it.

Separate what you report into three kinds, and say which is which:

- **Blocking** — the stated task can't be completed correctly without this
- **Non-blocking** — worth knowing, doesn't stop the change
- **Out of scope** — a proposed issue for another branch

Approval is per-action. My approving something once doesn't authorize it in
other contexts or later branches.

Don't reformat files you aren't otherwise changing.

## Reporting

Report failures rather than working around them. A blocked task described
accurately is more useful than a task completed differently.

Verify before reporting done. Don't describe a change as working without
having run it.

## Never

- Browser storage of any kind (`localStorage`, `sessionStorage`, cookies)
- New dependencies or CDN scripts
- `innerHTML` with interpolated data — build DOM nodes
- Direct commits to `master`

## Pull requests

## Pull requests

Work happens on a branch off `master` and reaches `master` only through a
pull request I review manually. Never merge.

## Decisions

`decisions/` holds architecture decision records, named
`ADR-NNNN-short-slug.md` — four-digit sequence, then a slug saying what the
decision was, not what kind of file it is.

Write one when a real choice was made between alternatives worth naming. Most
PRs don't need one. If there was no alternative, there was no decision.

Structure:

- **Context** — what forced the choice
- **Decision** — what was chosen
- **Alternatives rejected** — and why. This is the part with long-term value.
- **Consequences** — what this makes easier or harder later

Records are append-only. Reversing a decision means a new ADR that names the
one it supersedes; never edit or delete the original.

When you believe a branch warrants an ADR, draft it and say so. I decide
whether it lands. Record only decisions I made — not ones you inferred from
the diff.
