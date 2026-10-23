// Portfolio content: categories, gallery items (work, quotes, contact) and image file names.

export type CatKey = "uxui" | "icon" | "app" | "3d" | "other";
export const CATS: Record<CatKey, { name: string; color: string; icon: string }> = {
  uxui: { name: "UX/UI Design", color: "yellow", icon: "i-uxui" },
  icon: { name: "Icon Design", color: "red", icon: "i-icon" },
  app: { name: "App Icon", color: "blue", icon: "i-app" },
  "3d": { name: "3D Design", color: "green", icon: "i-3d" },
  other: { name: "Other Design", color: "orange", icon: "i-other" },
};

// Original upload names (from kadenjohnson.me) mapped to the optimized files in public/images
const FILES: Record<string, string> = {
  "1.0-Home-Page": "1.0-Home-Page.webp", "334shots-so": "334shots-so.webp", "4": "4.png",
  "487shots-screenshot": "487shots-screenshot.webp", "64shots-screenshot": "64shots-screenshot.webp", "8": "8.svg",
  "986shots-so": "986shots-so.webp", "Amazing-Mockup": "Amazing-Mockup.webp", "Before--After": "Before--After.webp",
  "Boulder-Icon-Logo": "Boulder-Icon-Logo.png", "Casey-Headshot": "Casey-Headshot.jpeg", "Colors": "Colors.webp",
  "Emily-Headshot": "Emily-Headshot.jpeg", "Kaden-Logo-copy-01": "Kaden-Logo-copy-01.svg", "Login-Page": "Login-Page.webp",
  "SVW-Cover": "SVW-Cover.webp", "SVW-Logo": "SVW-Logo.png", "Sarah-Prince-photo": "Sarah-Prince-photo.jpeg",
  "Shots-Create-Mockups-5_1": "Shots-Create-Mockups-5_1.webp", "Shots-create-mockups-1": "Shots-create-mockups-1.webp",
  "Shots-create-mockups-11": "Shots-create-mockups-11.webp", "Shots-create-mockups-12": "Shots-create-mockups-12.webp",
  "Shots-create-mockups-5": "Shots-create-mockups-5.webp", "Shots-create-mockups-6": "Shots-create-mockups-6.webp",
  "Shots-mockup-1": "Shots-mockup-1.webp", "UVUHorizontalGreen-0009": "UVUHorizontalGreen-0009.png",
  "Wireframe---1.0-Home-Page": "Wireframe---1.0-Home-Page.webp", "card-anatomy": "card-anatomy.webp",
  "eye-tracking": "eye-tracking.webp", "home-CTA": "home-CTA.webp", "site-map": "site-map.webp",
};
export const img = (src?: string | null) => (src ? FILES[src.replace(/\.[^.]+$/, "")] ?? src : src);

export type Body = "kpm" | "class-sign-ups" | "startup-design" | "online-menu" | "simple" | "model";
export interface Work {
  kind: "work"; id: string; title: string; sub: string; cats: CatKey[];
  mat: "paper" | "metal" | "acrylic" | "stock"; r: number; wide?: boolean;
  src?: string | null; label: string; ratio?: string; body: Body; figs?: [string, string][];
  ba?: { before: string; after: string; beforeLabel: string; afterLabel: string; live?: [string, string]; links?: [string, string][] };
  model?: { key: string; what: string; yaw: number; pitch: number; color?: string };
}
export interface Quote { kind: "quote"; id: string; r: number; who: string; role: string; photo: string; logo: string; quote: string }
export interface Contact { kind: "contact"; id: string; r: number }
export type Item = Work | Quote | Contact;

const TBD = "[One-line description]";

export const ITEMS: Item[] = [
  { kind: "work", id: "kpm", title: "KPM Analytics Website", sub: "Owning the company website end to end in Webflow", cats: ["uxui"], mat: "metal", wide: true, r: -0.5,
    label: "KPM Analytics website", ratio: "16/9", body: "kpm",
    ba: { before: "kpm-site-2024-10.webp", after: "kpm-site-now.webp", beforeLabel: "October 2024", afterLabel: "Now",
      // Working prototypes rebuilt from the real pages (kpmanalytics.com and the archive refuse to be framed)
      live: ["/kpm/2024.html", "/kpm/now.html"],
      links: [["Visit the live site", "https://www.kpmanalytics.com/"], ["View the October 2024 archive", "https://web.archive.org/web/20241001071259/https://www.kpmanalytics.com/"]] } },
  { kind: "work", id: "class-sign-ups", title: "Design to Improve Class Sign Ups", sub: "University department website design and research", cats: ["uxui"], mat: "paper", r: 1.1,
    src: "986shots-so.png", label: "SLSS website on a monitor", body: "class-sign-ups" },
  { kind: "work", id: "startup-design", title: "Bringing Design to a Startup AI Company", sub: "Enhancing developers' efficiency in creating consistent designs", cats: ["uxui"], mat: "acrylic", r: -1.2,
    src: "487shots-screenshot.png", label: "Smart Vision Works dashboard", body: "startup-design" },
  { kind: "quote", id: "q1", r: 1.4, who: "Emily Hedrick", role: "Assistant Professor of Digital Media, UVU", photo: "Emily-Headshot.jpeg", logo: "UVUHorizontalGreen-0009.png",
    quote: "Kaden is easy to work with, is organized, communicates well, and has all the characteristics one would hope in a UX designer." },
  { kind: "work", id: "online-menu", title: "Creating an Engaging Online Menu Experience", sub: "Improving a restaurant's digital menu experience prototype", cats: ["uxui"], mat: "paper", wide: true, r: 0.6,
    src: "334shots-so.png", label: "Menu app on three phones", ratio: "16/9", body: "online-menu" },
  { kind: "work", id: "boulder", title: "Boulder Icon Logo", sub: TBD, cats: ["icon"], mat: "metal", r: 1.0, src: "Boulder-Icon-Logo.png", label: "Boulder icon logo", ratio: "1/1", body: "simple" },
  { kind: "work", id: "login-page", title: "Login Page", sub: TBD, cats: ["uxui"], mat: "stock", r: -0.9, src: "Login-Page.png", label: "Login page", body: "simple" },
  { kind: "quote", id: "q2", r: -1.3, who: "Casey Merrill", role: "Software Engineering Manager, Smart Vision Works", photo: "Casey-Headshot.jpeg", logo: "SVW-Logo.png",
    quote: "Kaden is an excellent designer who really tries to understand the customer's perspective." },
  { kind: "work", id: "vela", title: "Vela", sub: TBD, cats: ["icon"], mat: "acrylic", r: 0.8, src: "8.svg", label: "Vela logo", ratio: "16/9", body: "simple",
    figs: [["8.svg", "Vela wordmark"], ["4.png", "Vela mark"]] },
  { kind: "work", id: "wolf-article", title: "[Project title]", sub: TBD, cats: ["uxui"], mat: "paper", r: -0.7, src: "Shots-create-mockups-12.png", label: "Wolf article on a phone", body: "simple" },
  { kind: "work", id: "emma-site", title: "Emma Johnson Website", sub: TBD, cats: ["uxui"], mat: "stock", r: 0.4, src: "Amazing-Mockup.png", label: "Emma Johnson site on a phone", body: "simple" },
  { kind: "work", id: "app-icon-slot", title: "[Add App Icon work]", sub: TBD, cats: ["app"], mat: "metal", r: -1.0, src: null, label: "App icon", ratio: "1/1", body: "simple" },
  { kind: "quote", id: "q3", r: 0.9, who: "Sarah Prince", role: "Customer Support Integration Manager, Smart Vision Works", photo: "Sarah-Prince-photo.jpeg", logo: "SVW-Logo.png",
    quote: "Kaden has a great work ethic and eye for what's missing or needed. He's reliable and the kind of employee I could put on any task." },
  { kind: "work", id: "surf-watch", title: "[Project title]", sub: TBD, cats: ["uxui"], mat: "paper", r: 1.2, src: "Shots-create-mockups-11.png", label: "Surf report on a watch", body: "simple" },
  { kind: "work", id: "low-poly-kiwi", title: "Low Poly Kiwi", sub: TBD, cats: ["3d"], mat: "acrylic", r: -0.6, label: "Low poly kiwi", ratio: "1/1", body: "model",
    model: { key: "kiwi", what: "half a kiwi", yaw: -0.6, pitch: 0.72 } },
  { kind: "work", id: "knapped-rock", title: "Knapped Rock", sub: TBD, cats: ["3d"], mat: "metal", r: 0.9, label: "Knapped rock", ratio: "1/1", body: "model",
    model: { key: "rock", what: "a knapped stone", yaw: -0.6, pitch: 0.35, color: "#7C8AA0" } },
  { kind: "contact", id: "contact", r: -0.4 },
];

export const CONTACT = {
  email: "nokadensly@gmail.com",
  linkedin: "https://www.linkedin.com/in/kaden-johnson-40b155196",
  x: "https://twitter.com/kadensly",
  form: "https://docs.google.com/forms/d/e/1FAIpQLSeSSAmqhlVpIidjZh5HEQtAo3OyBj-CehBYQn9eOJFpNWvKWw/viewform",
};
