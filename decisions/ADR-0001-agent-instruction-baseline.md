# Portfolio — Design Decisions

Working record for `ryansmithportfolio.github.io`. This is the shared context for
any conversation about the site. Update it when a decision changes; it is the
merge point between separate chats, not any individual conversation.

---

## What this site is

A **professional-only** site. Personal work (photography, music, travel writing)
lives at `experealization.wordpress.com` and is not duplicated here.

The site should reflect values and taste, not target a job title. The traits it
should demonstrate — not claim — are the ones colleagues would name first:
technically adept, reads a room, works with anyone, gives a shit about the work.

**Audience.** Written for someone technical and discerning who notices
imprecision and reads generic phrasing as evasion. If a line could be said by
any engineer, it isn't finished.

---

## Governing principle

> **The site must be able to justify every byte it loads.**

Adopted after an audit found four vendor libraries doing nearly nothing. It
applies to visual elements as much as dependencies: anything decorative that
carries no information is the first thing cut.

Corollary that came up repeatedly and should be watched for: **reaching for
borrowed visual interest instead of making a decision.** Floating
orbs, Kandinsky reproduction, node graph without edge semantics, stock HUD
globe — same failure each time. If an element's justification is "it looks
neat," it hasn't earned its place.

Second recurring pattern to watch: **filling a gap with photographs** when the
category needs evidence. Photos prove presence, not capability.

---

## Information architecture

Three lenses, not categories. A project can appear under more than one; the
framing changes with the lens rather than repeating the same content.

| Lens            | Subtitle                                 | Artifact                                            |
| --------------- | ---------------------------------------- | --------------------------------------------------- |
| **Collaborate** | Two enterprise orgs, one data model      | PepsiCo CRM + Jack Link's EDI (merged as one story) |
| **Structure**   | A dozen integrations down to three lines | sy-trance                                           |
| **Deliver**     | Shipped, then measured                   | Sanity Check                                        |

**Rejected terms and why.** _Discover_ — liked conceptually, no artifact to fill
it. _Develop_ — too narrow, reads as "writing code," drops the coordination work
that is the actual differentiator. _Architect_ — not the real title, reads as
overclaim. _Translate_ — genuinely true at three levels (teaching English in
Bangkok, ETL, translating between marketing and engineering), strong enough to
revisit later, but currently unplaced. _Build · Integrate · Deliver_ — the
original tagline; generic, true of every engineer. _Composed · Traceable ·
Trusted_ — from the ModernAge mockup; describes a product's properties, not a
person's work. Alliterative D-triads read as consultancy templates.

**Not yet included.** Daybreak — not shipped. Goes on the site when there's a
safe alpha demo, not before. Halston client site — likely confidentiality and
asset-ownership problems; treat as upside, not as a plan.

### Slide format

Two paragraphs per artifact: what the situation was, who had to agree and why
that was hard, what was built, what it made possible. Same standard for every
slide regardless of project size — a small project honestly told is fine, an
unfinished one is not.

**Proprietary line.** The shape of the problem and what you did about it is
yours to tell. Implementation belongs to the employer: no code, schemas, data
models, volumes, or internal process detail for Symphony, PepsiCo, Jack Link's,
or Housing.Cloud. The insight is the interesting part anyway.

**Consent line.** Any photo including colleagues requires their approval, asked
fresh — a 2010 photo surfacing on a public 2026 site is a different thing than
what they originally agreed to.

---

## Landing page

One view, no scroll. A radial instrument divides proportionally into the three
lenses.

**Settled — structural, survives any palette change:**

- Proportional weighting: arc size reflects the actual weight of each body of
  work. Deliver is genuinely smaller and is sized honestly rather than padded
  to look equal.
- Composable: adding a fourth lens reflows the dial with no redesign. Geometry
  must be computed from weights at render time, never hardcoded.
- Hard edges — butt caps, flat radial end faces, real gaps between segments.
  Rounded caps read as soft UI; flat faces read as machined.
- Hexagonal artifact markers. A hex head is a fastener, and it carries the
  artifact count.
- Recessed centre well, which doubles as the at-rest state display and fills
  with detail on selection.
- Engraved wordmark: `RYAN SMITH` in letterspaced serif caps with a double rule
  and rosette. Not mixed case.
- Intersecting translucent planes passing behind the case — depth without an
  image.
- Guilloché field, machined lugs aligned to segment boundaries, brass tick
  track.
- Visible nav (contact), no hamburger at desktop width.
- Footer: location, dynamic copyright year, résumé link.
- Portrait demoted from the centre of the composition.

**Not settled — currently paint:**

- The specific palette. Derived from a personal photograph, deliberately held
  loosely. Final values should follow from what the project slides need, not
  precede them.
- Centrepiece image. Slot is built to be swappable. Currently a placeholder.
- Whether the tick track is a real scale (only defensible if segment boundaries
  align to ticks).
- Knurling — closest remaining element to pure decoration.

### Palette (current, provisional)

Sampled from a personal photograph and deliberately low-saturation, so segments
separate by value and small hue shifts rather than by hue contrast. This means a
fourth segment won't need another loud colour.

```
ground        #090E16 → #182130
steel dark    #39424F
steel mid     #68748B
steel light   #C8D0DA
brass         #A08B5E
collaborate   #4E6178   bevel #8B9AB2
structure     #476E67   bevel #7FA79E
deliver       #A08256   bevel #D6B888
text          #D2DAE4
text muted    #8E99AC
```

All colours belong in `:root` as custom properties. No hex values elsewhere.

### Planned, not built

- **Many-to-many tagging.** A project has a primary lens but appears under
  others, its marker tinted to its primary. Two open problems: colour alone
  fails for colour-blind users, so borrowed markers need a second cue (outline
  vs. fill, or smaller radius); and with only three artifacts, showing borrowed
  markers at rest makes the ring look busy while disguising how little is
  there. Consider revealing borrowed markers only on hover of their home
  segment.
- **Click-and-drag rotation** with the projections shifting alongside. Earned
  only if rotation changes state (snapping a segment to a selection marker). If
  it spins without doing anything it's a fidget toy. Needs a keyboard
  equivalent and a `prefers-reduced-motion` path.

### Accessibility, non-negotiable

Hover and `:focus-visible` get identical treatment. Every segment and marker
keyboard-reachable via real `<a>` or `<button>` elements, not bare SVG paths
with click handlers. The centre well is a live region if it swaps content.
Check non-text contrast on segment edges.

---

## Technical state

Static site, GitHub Pages, served from the repo root. Keep the existing repo and
address. No framework, no build step, no bundler.

**Dependency cleanup — completed.** Removed after a runtime audit proved each
unused: two Google Fonts (Volkhov, Raleway — body stack is Inter), the Bootstrap
JS bundle (zero component classes in the DOM), and bxslider plus its init call
(zero matching elements). Page rendered pixel-identical afterward.

**Remaining, in order:**

1. **wow.js + animate.css** — one `.wow` element, 185 CSS rules. Replace with a
   CSS transition or a short `IntersectionObserver`, then delete both. Remove
   the `WOW` init in `app.js` in the same commit.
2. **Bootstrap CSS** — 10 grid hits (`container`/`row`/`col-`), zero utility
   classes. Hand-write the grid; an afternoon, not a project.
3. **jQuery** — 30 `$()` call sites across `app.js` (20) and `modal.js` (10).
   Biggest byte win, and the only step that can break behaviour rather than
   layout. Do it last.

**Old landing** preserved as `projects.html` rather than deleted — it holds real
work to port piece by piece.

**Contact** needs a third-party handler (Formspree, Cloudflare Worker) since
Pages has no backend. A form is also the privacy-preserving option: the address
never appears in markup.

---

## Working practice

- Fork conversations by workstream (content, design, build). Context does not
  cross between chats even inside a project — this file is the only merge point,
  and it lives in the repo under version control.
- Push back when a direction is wrong. Several good decisions in this project
  came from killing ideas that were liked but unsupported.
- Design is currently ahead of content. The frame exists and is waiting on the
  thing it frames.

---

## Next

Write the **Collaborate** slide. It is the story never told publicly, the most
impactful one available, and it sets the template the other two follow.
