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

// Features built in code (not editable text): the KPM before/after compare and the 3D models
export interface Compare {
  before: string; after: string; beforeLabel: string; afterLabel: string;
  full?: { before: [string, number, number]; after: [string, number, number] }; links?: [string, string][];
}
export interface ModelInfo { key: string; what: string; yaw: number; pitch: number; color?: string }
export const FEATURES: Record<string, { ba?: Compare; model?: ModelInfo }> = {
  kpm: { ba: { before: "kpm-site-2024-10.webp", after: "kpm-site-now.webp", beforeLabel: "October 2024", afterLabel: "Now",
    // Full-length homepage screenshots (1440px wide) for the side-by-side compare in the lightbox
    full: { before: ["kpm-site-2024-10-full.webp", 1440, 6666], after: ["kpm-site-now-full.webp", 1440, 4332] },
    links: [["Visit the live site", "https://www.kpmanalytics.com/"], ["View the October 2024 archive", "https://web.archive.org/web/20241001071259/https://www.kpmanalytics.com/"]] } },
  "low-poly-kiwi": { model: { key: "kiwi", what: "half a kiwi", yaw: -0.6, pitch: 0.72 } },
  "knapped-rock": { model: { key: "rock", what: "a knapped stone", yaw: -0.6, pitch: 0.35, color: "#7C8AA0" } },
};
