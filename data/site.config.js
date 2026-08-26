/**
 * Landing page content and dial geometry source.
 *
 * The dial in js/wheel.js is generated entirely from this object. Arc angles are
 * derived from each segment's `weight` as a proportion of the total, so adding,
 * removing, or reweighting a segment reflows the whole dial with no other edit.
 * Segment count is never assumed anywhere.
 *
 * Segment fields:
 *   id          stable slug, used for element ids
 *   label       displayed outside the arc, letterspaced
 *   subtitle    one line under the label
 *   weight      relative arc share; unitless, any positive number
 *   color       arc band fill
 *   bevelColor  lighter outer highlight along the arc, and the focus ring
 *   href        where activating the whole segment goes
 *   artifacts   hex markers laid out along the segment's mid-angle
 */
export const config = {
  centerImage: 'assets/logo.png',
  centerAlt:
    'Stylized illustration of a networked globe ringed by orbital arcs, with ' +
    'connected nodes linking continents across a dark slate field.',

  segments: [
    {
      id: 'collaborate',
      label: 'Collaborate',
      subtitle: 'Two enterprise orgs, one data model',
      weight: 2,
      color: '#4E6178',
      bevelColor: '#8B9AB2',
      href: 'projects.html#gram',
      artifacts: [
        { name: 'Gram — real-time whiteboard', href: 'projects.html#gram' },
        { name: 'Immedia — 10-API aggregator', href: 'projects.html#immedia' },
      ],
    },
    {
      id: 'structure',
      label: 'Structure',
      subtitle: 'A dozen integrations down to three lines',
      weight: 2,
      color: '#476E67',
      bevelColor: '#7FA79E',
      href: 'projects.html#trifecta',
      artifacts: [
        { name: 'Trifecta — workflow builder', href: 'projects.html#trifecta' },
        { name: 'Decision Tree', href: 'projects/decision-tree/index.html' },
      ],
    },
    {
      id: 'deliver',
      label: 'Deliver',
      subtitle: 'Shipped, then measured',
      weight: 1.1,
      color: '#A08256',
      bevelColor: '#D6B888',
      href: 'projects.html#sanity-check',
      artifacts: [
        { name: 'Sanity Check — live app', href: 'https://sanity-check-lyart.vercel.app' },
        { name: 'Scheduled Reports (PDF)', href: 'assets/ryan-smith-scheduled-reports.pdf' },
      ],
    },
  ],
};

export default config;
