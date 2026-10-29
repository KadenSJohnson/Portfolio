// The portfolio's editable content, as it stands in the repo. The site uses this when Sanity isn't
// set up (or can't be reached), and scripts/seed-sanity.mjs copies it into Sanity the first time.
// Lightbox text is Portable Text (Sanity's rich text format), written with the helpers below.

import type { CatKey } from "./projects";

export type Span = { _type: "span"; _key: string; text: string; marks: string[] };
export type Block =
  | { _type: "block"; _key: string; style: "normal" | "lead" | "note" | "h3"; children: Span[]; markDefs: { _type: "link"; _key: string; href: string }[] }
  | { _type: "metaTable"; _key: string; rows: { _key: string; label: string; value: string }[] }
  | { _type: "stats"; _key: string; items: { _key: string; num: string; label: string; detail?: string }[] }
  | { _type: "figures"; _key: string; cols: 1 | 2; items: { _key: string; imageFile?: string; image?: SanityImage; label: string }[] }
  | { _type: "pullQuote"; _key: string; text: string; cite: string }
  | { _type: "problemSolution"; _key: string; problem: string; solution: string };
export type SanityImage = { asset?: { _ref: string } };

let n = 0;
const k = () => `k${(n++).toString(36)}`;
const span = (text: string, marks: string[] = []): Span => ({ _type: "span", _key: k(), text, marks });
const block = (style: "normal" | "lead" | "note" | "h3", text: string): Block => ({ _type: "block", _key: k(), style, children: [span(text)], markDefs: [] });
const p = (t: string) => block("normal", t);
const lead = (t: string) => block("lead", t);
const note = (t: string) => block("note", t);
const h = (t: string) => block("h3", t);
const link = (text: string, href: string): Block => {
  const key = k();
  return { _type: "block", _key: k(), style: "normal", children: [span(text, [key])], markDefs: [{ _type: "link", _key: key, href }] };
};
const meta = (rows: [string, string][]): Block => ({ _type: "metaTable", _key: k(), rows: rows.map(([label, value]) => ({ _key: k(), label, value })) });
const stats = (items: [string, string, string?][]): Block => ({ _type: "stats", _key: k(), items: items.map(([num, label, detail]) => ({ _key: k(), num, label, ...(detail ? { detail } : {}) })) });
const figs = (items: [string, string][], cols: 1 | 2 = 2): Block => ({ _type: "figures", _key: k(), cols, items: items.map(([imageFile, label]) => ({ _key: k(), imageFile, label })) });
const pull = (text: string, cite: string): Block => ({ _type: "pullQuote", _key: k(), text, cite });

export interface Settings {
  headline: string; headlineMuted: string; bio: string; email: string; linkedin: string; x: string; contactForm: string;
  contactHeading: string; contactLede: string;
}
export interface Project {
  id: string; order: number; title: string; subtitle: string; categories: CatKey[];
  material: "paper" | "metal" | "acrylic" | "stock"; wide?: boolean; tilt: number;
  imageFile?: string | null; image?: SanityImage; imageLabel: string; imageRatio?: string; body: Block[];
}
// Redlines: short notes on problems Kaden notices in other software, each with a clip or image
// shown in a device frame (phone or desktop) or as a close crop, plus an optional selection box.
export interface Redline {
  id: string; date: string; app: string; title: string;
  device: "phone" | "desktop" | "crop";
  video?: string; image?: string; poster?: string; imageAsset?: SanityImage; alt: string;
  focus?: string; zoom?: number; mark?: { x: number; y: number; w: number; h: number };
  heading1?: string; body1?: Block[]; heading2?: string; body2?: Block[]; heading3?: string; body3?: Block[];
  fixImage?: string; fixVideo?: string; fixImageAsset?: SanityImage; // optional sketch or mockup of the fix
}
export interface Testimonial { id: string; order: number; ask?: string; quote: string; name: string; role: string; photoFile: string; logoFile: string; photo?: SanityImage; logo?: SanityImage; tilt: number }

export const settings: Settings = {
  headline: "Hi, I'm Kaden Johnson",
  headlineMuted: "making the internet easier to use.",
  bio: "UX/UI designer at KPM Analytics with 5+ years across websites, product, and internal tools. Based in Salt Lake City, Utah.",
  email: "nokadensly@gmail.com",
  linkedin: "https://www.linkedin.com/in/kaden-johnson-40b155196",
  x: "https://twitter.com/kadensly",
  contactForm: "https://docs.google.com/forms/d/e/1FAIpQLSeSSAmqhlVpIidjZh5HEQtAo3OyBj-CehBYQn9eOJFpNWvKWw/viewform",
  contactHeading: "Say hi",
  contactLede: "Hire me, work with me, or just say hi.",
};

const TBD = "[One-line description]";
const simple = (desc: string, extra: Block[] = []) => [lead(desc), note("Add a short description of this project: what it was, your role, and how it turned out."), ...extra];
const model = (desc: string) => [lead(desc), p("Drag the model to spin it. On a keyboard, focus it and use the arrow keys."), note("Add a short description: what you made it with, how long it took, and anything you learned.")];

export const projects: Project[] = [
  { id: "kpm", order: 10, title: "KPM Analytics Website", subtitle: "Owning the company website end to end in Webflow", categories: ["uxui"], material: "metal", wide: true, tilt: -0.5,
    imageFile: null, imageLabel: "KPM Analytics website", imageRatio: "16/9",
    body: [
      meta([["Role", "Graphic Designer (Web & UX)"], ["Company", "KPM Analytics"], ["Timeline", "October 2024 – Present"], ["Tools", "Webflow, Figma, PostHog, Microsoft Clarity, Google Analytics"]]),
      lead("I own the company website in Webflow end to end, from research and design through build and ongoing updates, and partner with an outside dev team on SEO."),
      stats([["~43%", "Better average Google search ranking"], ["12.6%", "More search impressions, year over year"], ["~50%", "Faster mobile page load (LCP)"], ["12%", "More engagement time on organic visits"]]),
      h("What I've done"),
      p("Led the redesign of the homepage and blog. [Add the problem it solved and the result.]"),
      p("Helped build the team's design process, introducing A/B testing, a design system, and user research using PostHog, Microsoft Clarity, and Google Analytics."),
      p("Raised the share of mobile visits with good page load by 22 percentage points, and passed Core Web Vitals on desktop."),
      p("Designed landing page and social media templates that let marketing test ideas faster, and created sales tools and assets."),
      p("Partnered with engineering on UI work, and created AI skills to keep company use of Claude and other AI tools on brand."),
    ] },
  { id: "class-sign-ups", order: 20, title: "Design to Improve Class Sign Ups", subtitle: "University department website design and research", categories: ["uxui"], material: "paper", tilt: 1.1,
    imageFile: "986shots-so.png", imageLabel: "SLSS website on a monitor",
    body: [
      meta([["Role", "UI/UX Designer"], ["Team", "3 Designers, 2 Developers"], ["Timeline", "Aug – Dec 2022"], ["Skills", "UX research, UI design, Marketing, Ideation, Developer hand off"]]),
      lead("UVU's Student Leadership and Success Studies department helps students learn soft skills for their careers, with classes in stress management, speed reading, and leadership."),
      p("We found they lacked a website that communicated the value of their degrees and classes. Most students who took their classes enjoyed them, but the department had no way to communicate that value to new students. We found school counselors were the best CTA, and making sure students knew the class numbers was the next most effective way to get them to sign up."),
      h("Research and analysis"),
      p("During the discovery phase, we ran research to gather insights and understand user needs. Here are some of our survey results."),
      stats([["52%", "Had never heard of the SLSS department", "Only 7% had learned about it from the website."], ["80%+", "Enjoyed the classes they took"], ["Top 3", "Leadership, stress management, job placement", "What students said mattered most."]]),
      h("Insights: users didn't know who they are or why they should care"),
      p("From user interviews, questionnaires, and eye tracking, we found the site didn't tell users who the department was or why they should care about its classes."),
      p("Students had often heard of some classes, or even taken them, but didn't know the bigger picture. They tended to take only individual classes that friends or counselors suggested."),
      figs([["eye-tracking.png", "Eye tracking"], ["site-map.png", "Site map"]]),
      h("Ideating"),
      p("Once we had research insights and a clearer understanding of the requirements, we began designing in Figma. I was in charge of the home page wireframe: a larger header with a clear value proposition, and cards that show off the value of the department's most popular classes."),
      figs([["Wireframe---1.0-Home-Page.png", "Home page wireframe"]], 1),
      h("Game plan: a better call to action"),
      p("We decided the best CTA was to direct students to the counselors who often suggested these classes. To show off what the department offered, we made cards for the most popular classes, each with a tagline about why you'd want to take it."),
      figs([["home-CTA.png", "Home page CTA"], ["card-anatomy.png", "Card anatomy"]]),
      figs([["Shots-create-mockups-5.png", "Final design on a laptop"], ["1.0-Home-Page.jpg", "Full home page"]]),
      h("Pitch to the stakeholders"),
      p("We presented to the department faculty and left them with all of our research, designs, and ideas in a handoff document. The site is being developed by students at UVU."),
      pull("“Probably my favorite presentation. I really like how you used the data, the design of the site, the rationale, etc. Knocked it out of the park!”", "Faculty feedback"),
      h("Results"),
      stats([["32%", "Improvement to navigation", "Students took less time to get around the page."], ["70%", "Improvement to class selection", "Finding why to take a class improved by over 70%."], ["121%", "Improvement in counselor sign up", "Students found how to book a counselor over twice as fast."]]),
    ] },
  { id: "startup-design", order: 30, title: "Bringing Design to a Startup AI Company", subtitle: "Enhancing developers' efficiency in creating consistent designs", categories: ["uxui"], material: "acrylic", tilt: -1.2,
    imageFile: "487shots-screenshot.png", imageLabel: "Smart Vision Works dashboard",
    body: [
      meta([["Role", "UI/UX Designer"], ["Team", "1 Designer, 7 Developers"], ["Company", "Smart Vision Works"], ["Skills", "UI Design, UX Design, UI Development"]]),
      lead("Smart Vision Works is an AI food inspection tech company. I worked on UX, UI, graphic design, and more, alongside PhD experts in AI, machine learning, and manufacturing."),
      h("Consistency and speed of development"),
      p("A content audit found over 34 different shades of blue, the company's primary color, in the code base. Developers had no quick way to find brand colors, so they spent extra time hunting or used colors that didn't fit."),
      p("I worked with other departments on official brand color documentation, and built a color system and SCSS file that sped up developers choosing colors by over 50%."),
      stats([["34", "Shades of blue found in the code base"], ["50%+", "Faster color choices for developers"]]),
      figs([["Colors.png", "Color system"]], 1),
      h("Reducing dead clicks"),
      p("During a usability study I found a table design that was causing a lot of dead clicks: users averaged 4 per use. After the redesign, dead clicks dropped to zero."),
      figs([["Before--After.png", "Table, before and after"]], 1),
      h("V2 design using Figma"),
      p("I worked with developers and managers to create a complete design for a new version of one of the SVW products. Adding Figma to the process let stakeholders get much more involved, and kept designs consistent with the design system."),
      figs([["Shots-mockup-1.png", "V2 product design"], ["SVW-Cover.png", "Smart Vision Works brand pattern"]]),
    ] },
  { id: "boulder", order: 60, title: "Boulder Icon Logo", subtitle: TBD, categories: ["icon"], material: "metal", tilt: 1.0, imageFile: "Boulder-Icon-Logo.png", imageLabel: "Boulder icon logo", imageRatio: "1/1", body: simple(TBD) },
  { id: "vela", order: 80, title: "Vela", subtitle: TBD, categories: ["icon"], material: "acrylic", tilt: 0.8, imageFile: "8.svg", imageLabel: "Vela logo", imageRatio: "16/9",
    body: simple(TBD, [figs([["8.svg", "Vela wordmark"], ["4.png", "Vela mark"]])]) },
  { id: "wolf-article", order: 90, title: "[Project title]", subtitle: TBD, categories: ["uxui"], material: "paper", tilt: -0.7, imageFile: "Shots-create-mockups-12.png", imageLabel: "Wolf article on a phone", body: simple(TBD) },
  { id: "app-icon-slot", order: 110, title: "[Add App Icon work]", subtitle: TBD, categories: ["app"], material: "metal", tilt: -1.0, imageFile: null, imageLabel: "App icon", imageRatio: "1/1", body: simple(TBD) },
  { id: "surf-watch", order: 130, title: "[Project title]", subtitle: TBD, categories: ["uxui"], material: "paper", tilt: 1.2, imageFile: "Shots-create-mockups-11.png", imageLabel: "Surf report on a watch", body: simple(TBD) },
  { id: "flint", order: 145, title: "Flint", subtitle: "A personal tool for chipping low poly rocks and gems", categories: ["tools"], material: "paper", tilt: 0, imageFile: null, imageLabel: "A low poly stone made in Flint", imageRatio: "1/1",
    body: [
      meta([["Role", "Designer and developer"], ["Type", "Personal tool"], ["Built with", "HTML, JavaScript, SVG"], ["Exports", "SVG, PNG, OBJ"]]),
      lead("I kept needing low poly rocks for illustrations and 3D scenes, and modeling each one by hand was slow. So I built a small tool that lets me chip them into shape the way you would a real stone."),
      link("Open Flint", "/tools/flint/"),
      h("How it works"),
      p("Every rock starts as a block. A seed number cuts natural fractures into it, so the same seed always gives the same stone. Click an edge and a chip flies off; drag to turn the stone and work on another side."),
      p("Sliders set the size, thickness, number of fractures and how big each hammer strike is. Undo takes back one chip at a time, and Shuffle shows six more stones with the same settings."),
      h("Stone or gem"),
      p("Stone mode gives flat, illustrated faces with an outline. Gem mode adds transparency, frost, shine and a little chromatic aberration on the bright edges, so the same shape can become a polished crystal."),
      figs([["flint.mp4", "Stones made in Flint, turning as the material changes"]], 1),
      h("Made to fit my workflow"),
      p("The tool is one HTML file with no libraries. Everything is drawn as SVG, so a stone can be copied straight into Figma, saved as an SVG or a 2048px PNG, or exported as an OBJ model for Blender."),
      note("Draft text: edit it to tell the story in your own words."),
    ] },
];

export const testimonials: Testimonial[] = [
  { id: "q1", order: 40, ask: "Could I get a quote for my website?", tilt: 1.4, name: "Emily Hedrick", role: "Assistant Professor of Digital Media, UVU", photoFile: "Emily-Headshot.jpeg", logoFile: "UVUHorizontalGreen-0009.png",
    quote: "Kaden is easy to work with, is organized, communicates well, and has all the characteristics one would hope in a UX designer." },
  { id: "q2", order: 70, ask: "What was it like working with me?", tilt: -1.3, name: "Casey Merrill", role: "Software Engineering Manager, Smart Vision Works", photoFile: "Casey-Headshot.jpeg", logoFile: "SVW-Logo.png",
    quote: "Kaden is an excellent designer who really tries to understand the customer's perspective." },
  { id: "q3", order: 120, ask: "Got a minute to write me a quote?", tilt: 0.9, name: "Sarah Prince", role: "Customer Support Integration Manager, Smart Vision Works", photoFile: "Sarah-Prince-photo.jpeg", logoFile: "SVW-Logo.png",
    quote: "Kaden has a great work ethic and eye for what's missing or needed. He's reliable and the kind of employee I could put on any task." },
];

// Nitpicks live in Sanity. This list is only used if Sanity can't be reached.
export const redlines: Redline[] = [];
