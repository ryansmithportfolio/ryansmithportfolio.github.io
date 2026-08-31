# ADR-0006 — Separate artifact records from segment membership

## Context

The dial previously nested each artifact's complete record inside the segment
that displayed it. That made one concern carry two responsibilities: the
segment both described dial geometry and owned the content record. Moving an
artifact between segments therefore required moving its page data as well, and
the project index had to flatten the dial-oriented shape before it could route
to a detail page.

The content records include more than marker labels: prose, outgoing links, and
ordered image entries with their asset paths, alternative text, and captions.
Those records need to remain complete and independently addressable regardless
of the dial grouping that currently presents them.

## Decision

Keep every full artifact record in one top-level, slug-keyed collection in
`data/site.config.js`. Each segment holds an ordered list of artifact slugs.
The shared resolver in `js/projects.js` joins those references for both the dial
and the project index.

An artifact record retains all of its content fields, including the complete
`images` array. The segment reference is membership and presentation order
only; it does not duplicate or abbreviate the record.

## Alternatives rejected

**Keep records nested in segments.** Rejected because a segment is a dial
classification, not an owner of page content. It couples a content move to a
structural move and obscures that detail pages are addressable independently of
the dial.

**Duplicate a record under every segment where it appears.** Rejected because
the first shared artifact would create competing copies of its prose, links,
and image metadata. A single keyed record has one source of truth.

**Store only summary fields in the top-level collection.** Rejected because it
would split a page between the collection and the segment, particularly its
image assets. A reference must resolve to the whole record, not a partial view
of it.

**Derive membership from a field on each record.** Rejected because segment
order is presentation data. Keeping the references on segments makes both
membership and marker order visible where the dial is configured.

## Consequences

Easier: an artifact can move between segments by changing references only, and
both consumers share one resolution path. Full page data, especially image
asset references, stays together in an obvious place.

Harder: an invalid slug reference is now possible. The resolver skips an
unresolvable record and `buildIndex` warns in the console, following the
existing content-validation policy. Content authors must also keep the record
key and the record's `slug` field aligned until a later schema decision removes
that redundancy.
