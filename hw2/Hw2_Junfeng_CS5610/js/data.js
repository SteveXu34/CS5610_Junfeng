/* This file is to define the data for js.*/

// Define the elements for navigation items in the header.
const navItems = [
  {
    name: "Products",
    link: "/products/products.html"
  },
  {
    name: "Case Studies",
    link: "/case_studies/case_studies.html"
  },
  {
    name: "Blog",
    link: "/blog/blog.html"
  },
  {
    name: "About",
    link: "/about/about.html"
  },
  {
    name: "Contact",
    link: "/contact/contact.html"
  }
];


// element for products.
const products = [
    /* This is an array for product object*/
  {
    name: "Rocket Skates",
    description: "High-speed skates for fast escapes."
  },
  {
    name: "Portable Hole",
    description: "A convenient hole you can place almost anywhere."
  },
  {
    name: "Giant Magnet",
    description: "A powerful magnet for large-scale problems."
  }
];

const caseStudies = [
        /* This is an array for caseStudies object*/
  {
    title: "First case study (the title)",
    summary: "This is the summary of the first case study.",
    link: "first_one.html",
    gated: false
  },
  {
    title: "My second case study",
    summary: "This case study requires prior approval.",
    link: "second_one.html",
    gated: true
  }
];


//  For about.html. member information.
const teamMembers = [
  {
    name: "Bugs Bunny",
    role: "Chief Marketing Officer",
    image: "/Material/Bunny.webp",
    bio1: "Bugs has been in marketing since before marketing was a thing. Relaxed under pressure, disarmingly charming, and always three steps ahead of the competition, he brings a carrot-and-stick approach to brand strategy that has made Acme Corp a household name.",
    bio2: "Ask him a tough question and he'll answer it — eventually, after a detour through opera, cross-dressing, and a Beethoven sonata. The answer is always worth the wait. \"Ain't I a stinker?\""
  },

  {
    name: "Daffy Duck",
    role: "VP of Sales",
    image: "/Material/Duck.webp",
    bio1: "Daffy is the most enthusiastic person in any room he enters, which is saying something given that he tends to enter rooms at full volume. As VP of Sales he brings boundless energy, an iron will, and a closing rate that is statistically improbable.",
    bio2: "He is deeply motivated by recognition, which the team provides generously. His rivalry with Bugs in the Q3 pitch competition has become the stuff of Acme legend. \"You're desthpicable\" has never been used as a compliment more sincerely."
  },

  {
    name: "Porky Pig",
    role: "Chief Financial Officer",
    image: "/Material/Pig.webp",
    bio1: "Porky is the steady hand behind Acme Corp's finances — methodical, precise, and the only person on the leadership team who has never accidentally launched himself into a canyon. He joined Acme after a distinguished career in insurance, where he developed a specialty in product-liability claims.",
    bio2: "Porky's quarterly reports are models of clarity. His sign-offs are famously concise. \"Th-th-th-that's all, folks\" has appeared at the bottom of every board presentation since 2019, and the board loves it."
  },

  {
    name: "Road Runner",
    role: "VP of Delivery",
    image: "/Material/Road_runner.webp",
    bio1: "Nobody at Acme has ever missed a deadline — and that's largely because Road Runner sets them. As VP of Delivery, they oversee last-mile logistics across all product lines, maintaining a perfect on-time record that has baffled competitors and physicists alike.",
    bio2: "Road Runner holds the company record for fastest product deployment (0.3 seconds, desert terrain) and has never once been caught flat-footed by a vendor. Beep beep."
  },

  {
    name: "Wile E. Coyote",
    role: "Chief Innovation Officer",
    image: "/Material/coyote.webp",
    bio1: "Wile E. brings an unmatched appetite for innovation to Acme Corp — and we mean that literally. A self-described \"super genius,\" he holds 47 patents in propulsion, gravity manipulation, and portable hole technology, none of which have worked exactly as intended on the first try.",
    bio2: "His philosophy: every failed prototype is just a successful discovery of what not to do. Wile E. joined Acme straight out of the desert, where he conducted extensive field testing on the company's earliest product lines."
  }
];