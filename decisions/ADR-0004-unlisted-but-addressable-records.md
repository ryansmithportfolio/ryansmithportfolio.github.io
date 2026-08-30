# ADR-0004 — A record can be unlisted on the dial and still addressable by URL

## Context

`data/site.config.js` is becoming the site's complete content record so that
`projects.html`, the previous portfolio, can be retired without losing anything.
Most of what it holds transfers cleanly: the captioned walkthrough decks became
an `images` array, the contact URLs became a top-level `links` array, and neither
is read by anything yet.

One project did not transfer cleanly. `gram` exists only on `projects.html`. It
has a title, a subtitle, prose, a GitHub link, a lead image, and two slides — a
complete record by every measure the config uses — and it is not on the dial.

That is not an oversight to correct. The dial carries four lenses and seven
markers, and the composition is deliberate: `radialSpot` offsets every lens's
marker row by the busiest lens's project count, so an eighth marker in
`collaborate` would push all four rows down a line in the wide layout, and
`stackedSpots` advances its cursor by the row count, so the same record would
shift every lens block below it 64 units in the compact layout. The reflow is
correct behaviour for a project that belongs on the dial. `gram` does not.

So the config had to be able to hold a record the dial does not draw. The
alternative was to let the retirement of `projects.html` delete a project.

## Decision

An artifact may carry `listed: false`. The flag means one thing and no more: the
dial leaves the record out of its marker layout. Everything else about the record
is unchanged — it stays in the config, `js/projects.js` indexes it, `#/p/gram`
resolves on a cold load, and the detail view renders it identically to any other
project.

`listed` is absent on every other record. Absent means listed, so adding the
mechanism required no edit to the seven existing artifacts, and the flag reads as
the exception it is rather than as boilerplate on eight records.

The filter is one helper in `js/wheel.js`, applied at all four places the layout
reads artifacts — `radialSpot`, `stackedSpots`, the `maxCount` reduce in
`computePlacements`, and `buildArtifactLinks`. With it in place, adding `gram`
leaves the generated dial markup byte-identical at both breakpoints, which is how
the change was verified.

This does move one fact: `js/wheel.js` now reads a field the config header
comment used to promise it never would. The comment was corrected rather than
left to drift.

## Alternatives rejected

**A zero-weight segment holding the unlisted projects.** The obvious reach, since
`weight` already controls how much dial a thing gets and zero is the natural
"none". It does not fit the model. `weight` is a segment property; artifacts have
none, and are laid out along their segment's mid-angle rather than given an arc
share of their own. A zero-weight segment would also still be a segment:
`computeLayout` derives `available = 360 - segments.length * GAP_DEG`, so a fifth
segment steals seven degrees of gap from the four real ones and shifts every arc
boundary, and `buildCase` would draw its boundary tab. A zero-weight arc is
invisible but not absent, which is the opposite of what was needed. Adding an
artifact-level `weight` purely to be able to set it to zero would introduce a
property with one legal value and no meaning on the dial.

**Filtering inside `buildArtifactLinks` only.** A one-line change, and tempting
for it. Rejected because the marker positions are not computed there. `titleYs`,
`markerPos`, and `hits` are all built from the artifact list by index in
`radialSpot` and `stackedSpots`, so a filter at the point of drawing consumes a
shorter list against reservations made for a longer one: the wide layout gets a
hole in its marker row and the compact stack gets a blank 64-unit line. The
positions would also still be wrong for the markers that *are* drawn, because
`maxCount` would remain 3. Filtering upstream of the layout is what makes the
byte-identical claim true; it is not a tidier spelling of the same fix.

**Filtering in `buildIndex`.** `js/projects.js` already skips malformed records,
so an unlisted one looks like it belongs in the same pass. Rejected because that
is the one place the record must survive: `buildIndex` is what makes `#/p/gram`
resolve. Filtering there would make the flag mean "delete quietly", which is the
behaviour the flag exists to avoid. The separation is worth stating plainly —
`js/projects.js` decides whether a record is *usable*, `js/wheel.js` decides
whether it is *drawn*.

**Leaving `gram` in `projects.html`.** Costs nothing today and loses the record
on the day the page is deleted, which is a scheduled event. The whole point of
the migration is that the retirement has nothing left to rescue.

**Deleting `gram`.** Defensible as an editorial call — it is the oldest project
and the only one not chosen for the dial. Rejected because it is an editorial
call, and a data migration is the wrong branch to make one on. `listed: false`
keeps the decision reversible by a one-line edit and keeps the prose available in
the meantime.

**A separate top-level `unlisted` array.** Keeps `segments` as the exact
description of the dial, which has some appeal. Rejected because it splits one
kind of record across two shapes: `gram` still belongs to the `collaborate` lens,
and a second collection means `buildIndex` walks two paths, `lensLabel` has to be
sourced some other way, and every future consumer of the config has to know to
look in both places. A boolean on the record keeps one shape and one traversal.

## Consequences

Easier: the config can hold a project without the dial having to show it, which
is what lets `projects.html` be deleted as a pure removal. Because `listed`
defaults to true, the mechanism is invisible until used — no existing record
changed, and the diff that introduced it is one helper and four one-line swaps.
`gram` is now reachable at a URL it never had, and the two facts that used to be
one — a project exists, a project is on the dial — are now separately
controllable.

Harder: artifact count no longer equals marker count, so "why is there no marker
for X" becomes a data question before it is a code question. Anyone reading
`data/site.config.js` for the dial's contents now has to notice a flag. And the
guarantee that `js/wheel.js` reads only `name` and `href` off an artifact is
gone: the file now has an opinion about a third field, which is one more place
the dial and the content model touch than there was before.
