# ADR-0005 — One image collection, with images[0] as the lead

## Context

ADR-0004's migration left every artifact carrying two fields that describe the
same kind of thing. `image` and `imageAlt` held the picture the detail modal
opens on; `images` held the captioned walkthrough deck rescued from
`projects.html`, which nothing rendered. Two shapes, one concept, and a config
comment that had to explain why they were separate.

The separation was defensible while `images` was inert — ADR-0004's migration
was explicitly additive and left the rendering decision open. Rendering the deck
is that decision, and it forces the question the additive migration deferred: is
the lead one of the images, or a thing beside them?

The answer is constrained by what the data turned out to be. Seven of the eight
artifacts already had their lead file as the deck's first slide, because the old
page used the same picture for both. Only `trifecta` differed, leading on
`summary2.jpg`, which appears nowhere in its deck. So in practice the lead was
already the first image almost everywhere, described twice, and the two
descriptions had drifted: the same file carried `imageAlt: 'Decision Tree
Visualization'` in one field and `alt: 'Expanded tree graph with labelled
nodes'` in the other.

## Decision

`images` is the only image collection on an artifact. `image` and `imageAlt` are
gone. `images[0]` is the lead by position: it renders above the summary exactly
where the old lead did, and `images[1..]` stack below the summary as a gallery.

Position carries the meaning; nothing marks it. The lead's caption is not
rendered, because the lead has never shown one and several records now carry a
caption on entry zero only because it came across with the slide.

Two content calls followed from the data:

- **`trifecta`'s lead was prepended, not replaced.** Its `summary2.jpg` became a
  new entry zero, giving it six images. Promoting `create-task.jpg` to lead
  instead would have been a smaller diff, but it silently changes which picture
  the card opens on and drops a file from the site — a rendering change smuggled
  into a schema change.
- **Collapsed entries kept the lead's `alt`.** Where the lead file was already
  slide one, entry zero's `alt` was set to the old `imageAlt` value, so the
  rendered `<img alt>` did not move on any of the seven. The slide's own alt
  string was retired. The slide alts are arguably the better descriptions — they
  were written for the image rather than for the card — but choosing them would
  have changed the accessible name of seven images inside a change whose stated
  contract was that single-image modals render as before. Improving that alt text
  is a content edit, and it can be made in daylight.

`href` went at the same time. Every artifact's `href` pointed at
`projects.html#<slug>` and surfaced as a "Full write-up" link. Once the
walkthrough is in the modal, that link leads to a page showing the same content,
about to be deleted. Segment-level `href` values still point at
`projects.html` and are deliberately untouched; they belong to the retirement.

## Alternatives rejected

**A `mainImage` field naming an entry in `images`.** The most explicit option:
one collection, and a field saying which member leads. Rejected because it
introduces a dangling reference into a module whose entire contract is to warn
rather than throw (`js/projects.js`: "a content typo should cost a card, not the
whole page"). A `mainImage` that matches nothing has no good degradation — fall
back to entry zero and the field is advisory, drop the lead and the card loses
its opening image over a typo, and either way the reader cannot tell which
happened without reading the normalizer. Position cannot be misspelled.

**A `lead: true` flag on an entry.** Same explicitness, same failure class,
worse arity: a flag permits zero leads and permits two. Both then need a
documented tie-break, which is a rule existing only to describe malformed data.

**Keeping a separate `leadImage: { src, alt }` pair.** Tidier than
`image`/`imageAlt` in that the lead would at least share the entry shape.
Rejected because it preserves exactly the thing this record exists to remove:
two fields for one concept, and two places to look when an image is wrong. It
also keeps the drift alive — the seven duplicated files would still be described
twice, and nothing would stop the descriptions diverging again.

**Rendering the deck as a carousel, reusing `components/modal.js`.** That is how
`projects.html` shows this content today, and the code already exists. Rejected
as out of scope and as a dependency: the carousel is Bootstrap's, and the
landing page carries no framework. A vertical stack also needs no controls, no
focus management, and no state, which means it needs no tests to trust.

## Consequences

Easier: an artifact has one list of images, in order, each entry the same shape.
Adding a picture is appending to one array. The walkthrough content that has been
sitting inert in the config since ADR-0004 is now on screen, which removes the
last reason to keep `projects.html` reachable — its retirement is now a deletion
rather than a migration. And `js/project-view.js` builds every image through one
helper, so the lead and the gallery cannot drift apart in markup.

Harder: `images[0].caption` is now unreachable. Six records carry one, and two of
those — `scheduled-reports` and `sanity-check` — have exactly one image, so their
only caption renders nowhere at all while remaining visible on `projects.html`
today. That is real content going dark, accepted because showing a caption in the
lead position moves the summary down every card, and because the alternative
(deleting the captions) throws away text that a later design pass may want. The
config comment says the lead's caption is not shown, but a reader authoring a new
record still has to notice it.

Also harder: the lead is now positional, so it cannot be reordered without
changing which image leads. Moving entry zero is a visual change disguised as a
data reshuffle — the mirror image of the failure mode `mainImage` would have had,
and the cost of choosing position over a marker.
