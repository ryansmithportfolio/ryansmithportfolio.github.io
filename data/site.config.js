/**
 * Landing page content and dial geometry source.
 *
 * The dial in js/wheel.js is generated entirely from this object. Arc angles are
 * derived from each segment weight as a proportion of the total, so adding,
 * removing, or reweighting a segment reflows the whole dial with no other edit.
 * Segment count is never assumed anywhere.
 *
 * Top-level fields:
 *   centerImage the lens image at the dial centre, relative to the site root
 *   centerAlt   alt text for that image
 *   links       site-level destinations, in order: [{ label, href }]
 *   artifacts   full artifact records, keyed by their unique slugs
 *   segments    the arcs, in clockwise order from twelve
 *
 * Segment fields:
 *   id, label, weight, color, bevelColor, href
 *   artifacts   ordered artifact-slug references for this segment
 *
 * Artifact fields. name and listed drive dial markers; the rest drive the
 * detail view. Markers route to #/p/<slug> so a project is addressable on cold
 * load. listed: false removes a marker but retains its detail page.
 *   name, slug, listed, title, subtitle, summary
 *   links       extra destinations, in order: [{ label, href }]
 *   images      [{ src, alt, caption }], in order. images[0] is the lead; the
 *               remaining images are a captioned gallery. See ADR-0005.
 */
export const config = {
  "centerImage": "assets/logo.png",
  "centerAlt": "Stylized illustration of a networked globe ringed by orbital arcs, with connected nodes linking continents across a dark slate field.",
  "links": [
    {
      "label": "LinkedIn",
      "href": "http://linkedin.com/in/helloimryansmith"
    },
    {
      "label": "GitHub",
      "href": "https://github.com/magnanim0use"
    }
  ],
  "artifacts": {
    "decision-tree": {
      "name": "Decision Tree",
      "slug": "decision-tree",
      "title": "Decision Tree",
      "subtitle": "Interactive Hierarchical Data Visualization",
      "summary": "An interactive tree visualization tool built with React, Redux, and D3.js.",
      "links": [
        {
          "label": "Website",
          "href": "projects/decision-tree/index.html"
        },
        {
          "label": "GitHub",
          "href": "https://github.com/mtcrushmore/decision-tree"
        }
      ],
      "images": [
        {
          "src": "assets/decision-tree/dt-1.jpg",
          "alt": "Decision Tree Visualization",
          "caption": "Make your own interactive tree graph."
        },
        {
          "src": "assets/decision-tree/dt-2.jpg",
          "alt": "Tree with two subtrees collapsed into larger nodes",
          "caption": "Freely create and edit nodes to fit your needs. Mark as complete or delete, or MOVE nodes around the tree."
        },
        {
          "src": "assets/decision-tree/dt-3.jpg",
          "alt": "Edit A Node dialog over a dimmed tree",
          "caption": "Collapse nodes into easy-to-view subtrees. The more subnodes, the bigger the collapsed node will be."
        },
        {
          "src": "assets/decision-tree/dt-4.jpg",
          "alt": "Create A Node dialog above a Redux action log in devtools",
          "caption": "All interactions are redux actions, with a pre-state, dispatched action, and post-state."
        }
      ]
    },
    "experealization": {
      "name": "Experealization",
      "slug": "experealization",
      "title": "Experealization",
      "subtitle": "My Travel Blog",
      "summary": "A travel and work blog chronicling stories and photography across seven countries in Southeast Asia.",
      "links": [
        {
          "label": "Website",
          "href": "http://experealization.wordpress.com"
        }
      ],
      "images": [
        {
          "src": "assets/experealization/exp1.jpg",
          "alt": "Travel Blog",
          "caption": "Travel and work blog from my nearly two years in Southeast Asia."
        },
        {
          "src": "assets/experealization/exp2.jpg",
          "alt": "Blog post with a grid of Myanmar street and temple photos",
          "caption": "Designed using Wordpress, the blog chronicles stories and photography across seven countries."
        },
        {
          "src": "assets/experealization/exp3.jpg",
          "alt": "Blog post opening on an aerial photo of a tropical island",
          "caption": "This site sparked my interest in web design."
        }
      ]
    },
    "gram": {
      "name": "gram",
      "slug": "gram",
      "listed": false,
      "title": "gram",
      "subtitle": "Real-Time Whiteboarding & Chat",
      "summary": "A collaborative whiteboarding and chat tool built with Node/Express and Socket.io.",
      "links": [
        {
          "label": "GitHub",
          "href": "https://github.com/mtcrushmore/gram"
        }
      ],
      "images": [
        {
          "src": "assets/gram/gram1.jpg",
          "alt": "Gram Whiteboarding",
          "caption": "Gram is a real-time whiteboarding and chatting tool. When connected to the server, a user can contribute to both the whiteboarding and chat, and all users are updated in real-time. This app was built over the course of one-and-a-half workdays as part of a coding challenge."
        },
        {
          "src": "assets/gram/gram2.jpg",
          "alt": "The gram whiteboard and chat in a window over a desktop",
          "caption": "To achieve this cross-browser and cross-device functionality, Gram uses Node/Express and Socket.io on the back-end, and HTML5 Canvas, jQuery, and Socket.io on the front-end."
        }
      ]
    },
    "immedia": {
      "name": "Immedia — 10-API aggregator",
      "slug": "immedia",
      "title": "Immedia",
      "subtitle": "Real-Time Encyclopedia & News Aggregator",
      "summary": "A news, social media, and wiki aggregator that combines real-time updates with Wikipedia's depth.",
      "links": [
        {
          "label": "GitHub",
          "href": "https://github.com/The-Undefineds/immedia"
        }
      ],
      "images": [
        {
          "src": "assets/immedia/immedia1.jpg",
          "alt": "Immedia Interface",
          "caption": "A news, social media, and wiki aggregator from 10 APIs."
        },
        {
          "src": "assets/immedia/immedia2.jpg",
          "alt": "Event timeline beside an embedded YouTube player",
          "caption": "Gorgeous, interactive infographics and embedded content from the likes of Twitter and YouTube using D3.js & React."
        },
        {
          "src": "assets/immedia/immedia3.jpg",
          "alt": "A Wikipedia article with a Recent Media timeline added",
          "caption": "A Chrome extension that embeds on all Wikipedia articles, blending Wikipedia's depth with Immedia's recency."
        }
      ]
    },
    "trifecta": {
      "name": "Trifecta — workflow builder",
      "slug": "trifecta",
      "title": "Trifecta",
      "subtitle": "App Builder with AI-Powered Automation",
      "summary": "A secure network consisting of a composable backend, frontend builder, and workflow engine.",
      "links": [],
      "images": [
        {
          "src": "assets/trifecta/summary2.jpg",
          "alt": "Trifecta Framework"
        },
        {
          "src": "assets/trifecta/create-task.jpg",
          "alt": "Add New Task form with priority, status, and description",
          "caption": "In this sample app created with Trifecta, a user can create a new task after login. The UI is built via the drag-and-drop UI builder. A Task is an entity created with the backend builder, with associated RESTful API endpoints."
        },
        {
          "src": "assets/trifecta/workflow.jpg",
          "alt": "Five-step flow: webhook, OpenAI, two HTTP calls, Slack",
          "caption": "Once the task is created, a webhook triggers an automated workflow. In this sample, OpenAI will suggest steps to complete the new task, update the task, and send those updates to Slack."
        },
        {
          "src": "assets/trifecta/task-comment.jpg",
          "alt": "Task detail with numbered AI suggestions in the comments",
          "caption": "The task is updated with the generated suggestions within seconds (with relevant links)."
        },
        {
          "src": "assets/trifecta/slack.jpg",
          "alt": "Slack channel with a bot message and a linked article",
          "caption": "Slack is informed of the task updates per the workflow spec."
        },
        {
          "src": "assets/trifecta/diagram.jpg",
          "alt": "Circular infographic of the create-task-to-comment loop",
          "caption": "Creating a secure webhook triggers automated workflows, like AI generated task suggestions."
        }
      ]
    },
    "figma-wireframes": {
      "name": "E-commerce Wireframes (Figma)",
      "slug": "figma-wireframes",
      "title": "Hi-Fidelity",
      "subtitle": "E-commerce Wireframes Using Figma",
      "summary": "Part of a project to develop a loyalty program for an e-commerce site.",
      "links": [],
      "images": [
        {
          "src": "assets/product-school/figma-1.jpg",
          "alt": "E-commerce Wireframes",
          "caption": "Product Listing Page"
        },
        {
          "src": "assets/product-school/figma-2.jpg",
          "alt": "Loyalty dashboard with a team sidebar and a points panel",
          "caption": "Corporate Admin Dashboard"
        },
        {
          "src": "assets/product-school/figma-3.jpg",
          "alt": "Landing frame beside login, register, and personalize",
          "caption": "Prototype of Landing Page & Login/Signup Workflows"
        }
      ]
    },
    "scheduled-reports": {
      "name": "Scheduled Reports (PDF)",
      "slug": "scheduled-reports",
      "title": "Transporter",
      "subtitle": "Brief Presentation: Scheduled Reports of Sensitive Data",
      "summary": "An architectural deep dive into delivering scheduled reports of sensitive data to clients.",
      "links": [
        {
          "label": "View full PDF",
          "href": "assets/ryan-smith-scheduled-reports.pdf"
        }
      ],
      "images": [
        {
          "src": "assets/scheduled-reports/ryan-smith-scheduled-reports.jpg",
          "alt": "Scheduled Reports Architecture",
          "caption": "I made this slide deck for an interview, highlighting architectural decisions to deliver scheduled reports of sensitive data to clients while working for an e-commerce company."
        }
      ]
    },
    "sanity-check": {
      "name": "Sanity Check — live app",
      "slug": "sanity-check",
      "title": "Sanity Check",
      "subtitle": "Validate Your Message With AI Before You Hit Send",
      "summary": "Enter your message and the context behind it (it could be a URL, an email, or document) and get a sanity check from AI.",
      "links": [
        {
          "label": "Website",
          "href": "https://sanity-check-lyart.vercel.app"
        }
      ],
      "images": [
        {
          "src": "assets/sanity-check/home.png",
          "alt": "Sanity Check",
          "caption": "Simply enter your message and the context behind it (it could be a URL, an email, or document) and get a sanity check from AI. It will check for sentiment, tone, correctness, and of course, grammar and typos."
        }
      ]
    }
  },
  "segments": [
    {
      "id": "collaborate",
      "label": "Collaborate",
      "weight": 2,
      "color": "#4E6178",
      "bevelColor": "#8B9AB2",
      "artifacts": [
        "decision-tree",
        "experealization",
        "gram"
      ]
    },
    {
      "id": "structure",
      "label": "Structure",
      "weight": 2,
      "color": "#476E67",
      "bevelColor": "#7FA79E",
      "artifacts": [
        "immedia",
        "trifecta"
      ]
    },
    {
      "id": "craft",
      "label": "Craft",
      "weight": 1.1,
      "color": "#d3745c",
      "artifacts": [
        "figma-wireframes"
      ]
    },
    {
      "id": "deliver",
      "label": "Deliver",
      "weight": 1.1,
      "color": "#A08256",
      "bevelColor": "#D6B888",
      "artifacts": [
        "scheduled-reports",
        "sanity-check"
      ]
    }
  ]
};

export default config;
