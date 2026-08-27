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
 *   weight      relative arc share; unitless, any positive number
 *   color       arc band fill
 *   bevelColor  lighter outer highlight along the arc, and the focus ring
 *   href        where activating the whole segment goes
 *   artifacts   hex markers laid out along the segment's mid-angle
 *
 * Artifact fields. The first two drive the dial; the rest drive the detail view
 * rendered by js/project-view.js and are never read by js/wheel.js.
 *   name        hex marker label, revealed on hover/focus. Short by design.
 *   href        the long-form write-up on projects.html, offered as a link out
 *               of the detail view. Not where the hex marker points -- markers
 *               route to #/p/<slug> so a project is addressable on cold load.
 *   slug        stable, URL-safe id. Must be unique across every artifact.
 *   title       detail-view heading
 *   subtitle    one line under the heading
 *   summary     the prose blurb. Sourced from projects.html; keep them in step.
 *   image       lead image, relative to the site root
 *   imageAlt    alt text for that image; required whenever `image` is set
 *   links       extra destinations, in order: [{ label, href }]
 *
 * title, subtitle, and summary are the prose fields. js/projects.js warns to the
 * console when one is missing or blank rather than throwing, so a half-authored
 * record degrades to a thinner card instead of taking the page down.
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
      weight: 2,
      color: '#4E6178',
      bevelColor: '#8B9AB2',
      href: 'projects.html#decision-tree',
      artifacts: [
        {
          name: 'Decision Tree',
          href: 'projects.html#decision-tree',
          slug: 'decision-tree',
          title: 'Decision Tree',
          subtitle: 'Interactive Hierarchical Data Visualization',
          summary:
            'An interactive tree visualization tool built with React, Redux, ' +
            'and D3.js.',
          image: 'assets/decision-tree/dt-1.jpg',
          imageAlt: 'Decision Tree Visualization',
          links: [
            { label: 'Website', href: 'projects/decision-tree/index.html' },
            {
              label: 'GitHub',
              href: 'https://github.com/mtcrushmore/decision-tree',
            },
          ],
        },
        {
          name: 'Experealization',
          href: 'projects.html#experealization',
          slug: 'experealization',
          title: 'Experealization',
          subtitle: 'My Travel Blog',
          summary:
            'A travel and work blog chronicling stories and photography ' +
            'across seven countries in Southeast Asia.',
          image: 'assets/experealization/exp1.jpg',
          imageAlt: 'Travel Blog',
          links: [
            { label: 'Website', href: 'http://experealization.wordpress.com' },
          ],
        },
      ],
    },
    {
      id: 'structure',
      label: 'Structure',
      weight: 2,
      color: '#476E67',
      bevelColor: '#7FA79E',
      href: 'projects.html#immedia',
      artifacts: [
        {
          name: 'Immedia — 10-API aggregator',
          href: 'projects.html#immedia',
          slug: 'immedia',
          title: 'Immedia',
          subtitle: 'Real-Time Encyclopedia & News Aggregator',
          summary:
            'A news, social media, and wiki aggregator that combines ' +
            "real-time updates with Wikipedia's depth.",
          image: 'assets/immedia/immedia1.jpg',
          imageAlt: 'Immedia Interface',
          links: [
            {
              label: 'GitHub',
              href: 'https://github.com/The-Undefineds/immedia',
            },
          ],
        },
        {
          name: 'Trifecta — workflow builder',
          href: 'projects.html#trifecta',
          slug: 'trifecta',
          title: 'Trifecta',
          subtitle: 'App Builder with AI-Powered Automation',
          summary:
            'A secure network consisting of a composable backend, frontend ' +
            'builder, and workflow engine.',
          image: 'assets/trifecta/summary2.jpg',
          imageAlt: 'Trifecta Framework',
          links: [],
        },
      ],
    },
    {
      id: 'craft',
      label: 'Craft',
      weight: 1.1,
      color: '#d3745c',
      bevelColor: '#d69088',
      href: 'projects.html#figma-wireframes',
      artifacts: [
        {
          name: 'E-commerce Wireframes (Figma)',
          href: 'projects.html#figma-wireframes',
          slug: 'figma-wireframes',
          title: 'Hi-Fidelity',
          subtitle: 'E-commerce Wireframes Using Figma',
          summary:
            'Part of a project to develop a loyalty program for an ' +
            'e-commerce site.',
          image: 'assets/product-school/figma-1.jpg',
          imageAlt: 'E-commerce Wireframes',
          links: [],
        },
      ],
    },
    {
      id: 'deliver',
      label: 'Deliver',
      weight: 1.1,
      color: '#A08256',
      bevelColor: '#D6B888',
      href: 'projects.html#scheduled-reports',
      artifacts: [
        {
          name: 'Scheduled Reports (PDF)',
          href: 'projects.html#scheduled-reports',
          slug: 'scheduled-reports',
          title: 'Transporter',
          subtitle: 'Brief Presentation: Scheduled Reports of Sensitive Data',
          summary:
            'An architectural deep dive into delivering scheduled reports of ' +
            'sensitive data to clients.',
          image: 'assets/scheduled-reports/ryan-smith-scheduled-reports.jpg',
          imageAlt: 'Scheduled Reports Architecture',
          links: [
            {
              label: 'View full PDF',
              href: 'assets/ryan-smith-scheduled-reports.pdf',
            },
          ],
        },
        {
          name: 'Sanity Check — live app',
          href: 'projects.html#sanity-check',
          slug: 'sanity-check',
          title: 'Sanity Check',
          subtitle: 'Validate Your Message With AI Before You Hit Send',
          summary:
            'Enter your message and the context behind it (it could be a ' +
            'URL, an email, or document) and get a sanity check from AI.',
          image: 'assets/sanity-check/home.png',
          imageAlt: 'Sanity Check',
          links: [
            {
              label: 'Website',
              href: 'https://sanity-check-lyart.vercel.app',
            },
          ],
        },
      ],
    },
  ],
};

export default config;
