# ADR-0007 — Name addressable records entries

## Context

ADR-0006 separated the complete, addressable records from the segments that
present them on the dial. The collection was initially named `artifacts`, a
term inherited from the dial's hex markers. That name describes an item of
record but does not describe the collection's role: its records are the
site's addressable content and detail views, not merely dial decorations.

The hash route also carried a `p` prefix: `#/p/<slug>`. Slugs are unique keys
in the collection, so the prefix does not disambiguate a route. It would also
misdescribe an eventual About entry as a project route.

## Decision

Name the top-level record collection `entries`. Each segment uses `entries`
for its ordered list of slug references. In implementation, variables,
functions, comments, and accessibility copy use the same term.

Entry hashes are `#/<slug>`. The router recognizes that shape and reports an
unknown slug without throwing or hiding the dial.

## Alternatives rejected

**`projects`.** Rejected because the collection will hold About, which is an
entry but not a project.

**`pages`.** Rejected because the current presentation renders entries as
modal detail views rather than standalone pages. The word may become accurate
later, but it describes a rendering choice rather than the record.

**`documents`.** Rejected because it collides with documentation and browser
terminology, neither of which names the portfolio content.

**Keep the `p` route prefix.** Rejected because it carries no information once
the slug is a unique map key, and `#/p/about` would incorrectly classify a
non-project entry.

## Consequences

Easier: configuration, routes, and implementation language describe the same
kind of content without assuming every entry is a project. Shorter hashes are
also easier to read and share.

Harder: old `#/p/<slug>` links no longer resolve as entry routes. This is an
intentional route replacement, not a compatibility alias, because the old
prefix adds no namespace that needs preserving.
