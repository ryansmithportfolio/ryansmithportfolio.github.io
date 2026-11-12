# ADR-0008 — A record can point at a JSON content file that fills its modal

## Context

The Transporter project (`scheduled-reports`) outgrew the card. Its case study
has an at-a-glance strip, five sections of prose and term/description pairs, a
diagram, and a stack list. The card renders only `title`, `subtitle`,
`summary`, `images`, and `links`, so none of that had a home.

A standalone page at `projects/transporter/` was tried first. It read well, but
it broke the pattern every other project follows: a project lives at
`#/<slug>` and opens in the modal over the dial. The owner wants the case study
in the modal, at the same URL.

## Decision

An entry in `data/site.config.js` may carry `content`: a relative path to a
`.json` file. When that project's modal opens, the card renders at once from the
config as before, then `js/project-content.js` fetches the file, normalizes it
(`normalizeCaseStudy` in `js/projects.js`), and `js/project-view.js` appends the
case study between the summary and the links.

The file holds words only, in this shape, and every part is optional:

- `glance`: `[{ label, value }]`
- `sections`: `[{ heading, intro?, figure?: { src, alt, caption? }, points?: [{ term, text }] }]`
- `stack`: `[string]`

Section numbers, layout, and colour are CSS. The file never carries them.

The file is fetched on first open, not on page load, and is cached in memory
for the life of the page. A missing or malformed file is warned about in the
console and costs the case study, not the card.

A card with `content` gets the class `detail--case-study` when it is built,
before the fetch, and the overlay panel widens for it via `:has()`, so the
modal does not jump width when the content lands.

## Alternatives rejected

- **Inline the case study in `site.config.js`.** It works, but one record would
  be several times the size of every other, and the config is meant to stay a
  scannable index of the dial.
- **A standalone page per case study.** Breaks `#/<slug>` as the single address
  for a project and duplicates the site's chrome in a second place.
- **HTML or Markdown content files.** HTML would put markup in content, which
  this repo keeps out of data; Markdown would need a parser, which is a new
  dependency.
- **Fetching all content files on page load.** Every visitor would pay for case
  studies most will never open.

## Consequences

- Any project can gain a case study by adding one JSON file and one `content`
  line, with no code change.
- The renderer now has two entry points, `renderProjectDetail` and
  `renderCaseStudy`, both still detached and DOM-only, so a future standalone
  `/<slug>` page can reuse them unchanged.
- The modal's content arrives in two steps. On a slow connection the card shows
  without its case study for a moment.
- `:has()` is needed for the wider panel. Where it is unsupported the case
  study still renders, in the standard-width panel.
