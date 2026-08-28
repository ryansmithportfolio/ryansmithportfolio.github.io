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
that falls outside the scope, list it at the end of your response instead of
doing it.

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

Work happens on a branch off `master` and reaches `master` only through a
pull request I review manually.

When a branch is ready for PR, draft an entry in `decisions/` recording what
was chosen and what was rejected. The rejected options are the part with
long-term value. Draft it for review — don't treat it as final, and don't
record decisions you inferred from the diff rather than ones I made.
