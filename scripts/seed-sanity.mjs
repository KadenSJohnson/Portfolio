// One-time copy of src/data/local.ts into Sanity. Runs at the start of the build only when
// SANITY_WRITE_TOKEN is set (add it in Netlify, build once, then delete it). It only creates
// documents that don't exist yet, so it never overwrites anything edited in the Studio.
import { createClient } from "@sanity/client";
import { SANITY } from "../sanity.project.mjs";

const token = process.env.SANITY_WRITE_TOKEN;
if (!SANITY.projectId || !token) {
  console.log("[seed] Skipped (needs a project ID and SANITY_WRITE_TOKEN).");
  process.exit(0);
}
const { settings, projects, testimonials } = await import("../src/data/local.ts");
const strip = (o) => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== null && v !== undefined));
const client = createClient({ projectId: SANITY.projectId, dataset: SANITY.dataset, apiVersion: SANITY.apiVersion, token, useCdn: false, perspective: "raw" });
// Old layout fields the Studio doesn't show any more
const OLD = ["material", "tilt", "wide"];
const drop = (o) => Object.fromEntries(Object.entries(o).filter(([k]) => !OLD.includes(k)));

const tx = client.transaction();
tx.createIfNotExists({ _id: "siteSettings", _type: "siteSettings", ...settings });
for (const { id, ...p } of projects) {
  tx.createIfNotExists(strip({ _id: `project-${id}`, _type: "project", slug: { _type: "slug", current: id }, ...drop(p) }));
}
for (const { id, ...t } of testimonials) {
  tx.createIfNotExists(strip({ _id: `testimonial-${id}`, _type: "testimonial", ...drop(t) }));
}
// The first nitpick: added once with its video; the text is edited in the Studio
tx.createIfNotExists({ _id: "redline-first-nitpick", _type: "redline", title: "First nitpick", slug: { _type: "slug", current: "first-nitpick" },
  app: "Amazon", date: "2026-10-29", device: "phone", videoFile: "/video/first-nitpick.mp4", poster: "first-nitpick-poster.jpg",
  alt: "Screen recording on an iPhone: opening the Amazon app from the home screen" });
// Clear the old layout fields from documents that already have them (shows as "Unknown fields" in the Studio)
const stale = await client.fetch(`*[_type in ["project", "testimonial"] && (defined(material) || defined(tilt) || defined(wide))]._id`);
for (const id of stale) tx.patch(id, (p) => p.unset(OLD));
if (stale.length) console.log(`[seed] Removing old layout fields from ${stale.length} documents.`);
// Nitpicks moved from three fixed text fields (problem / why / fix) to three free titles with rich
// text. Carry over anything already written, under the old headings, so nothing is lost.
const key = () => Math.random().toString(36).slice(2, 10);
const toBlocks = (t) => (t ? [{ _type: "block", _key: key(), style: "normal", markDefs: [], children: [{ _type: "span", _key: key(), text: t, marks: [] }] }] : undefined);
const migrate = (d) => {
  if (d._type !== "redline" || !(d.problem || d.why || d.fix)) return null;
  const set = {};
  [["problem", "What I noticed"], ["why", "Why it matters"], ["fix", "How I'd fix it"]].forEach(([f, h], i) => {
    if (d[f]) { set[`heading${i + 1}`] = h; set[`body${i + 1}`] = toBlocks(d[f]); }
  });
  return set;
};
const allNitpicks = await client.fetch(`*[_type == "redline"]`);
for (const d of allNitpicks) {
  const set = migrate(d);
  if (set) { tx.patch(d._id, (p) => p.set(set).unset(["problem", "why", "fix"])); console.log(`[seed] Moved nitpick text into titles + rich text: ${d._id}`); }
}
try {
  await tx.commit();
  console.log(`[seed] Copied site text, ${projects.length} projects and ${testimonials.length} testimonials into Sanity (existing documents were left alone).`);
} catch (e) {
  console.error("[seed] Couldn't write to Sanity:", e.message);
  process.exit(1);
}


// One-time: Kaden's approved edits to the first nitpick (title, summary, captions, the fix, grammar).
// Skipped if the nitpick has been edited since.
try {
  const d = await client.fetch(`*[_id == "redline-first-nitpick"][0]{_updatedAt, body1}`);
  if (d && d._updatedAt === "2026-10-29T23:37:46Z") {
    const by = Object.fromEntries((d.body1 || []).map((b) => [b._key, b]));
    const span = (key, text, marks = []) => ({ _type: "span", _key: key, text, marks });
    const para = (key, children, markDefs = []) => ({ _type: "block", _key: key, style: "normal", markDefs, children });
    const body1 = [
      para("summary", [span("summary-s", "When you open Amazon’s iOS app, the screen flashes light, dark, light, dark and light again before the store loads.")]),
      para("1pvi4owy", [span("shbnru65", "iOS apps first zoom into their icon. ")]),
      para("7fab612b4aa0", [
        span("a9547b1bf941", "Then they switch to a "),
        span("d7ec70b4eaee", "launch screen", ["d96d5484221e"]),
        span("34a37568c990", ", which Apple says to keep nearly identical to the app’s first screen so users don’t experience flashing."),
      ], by["7fab612b4aa0"].markDefs),
      { ...by["row-launch"], caption: "1. Icon zooms open  ·  2. Dark launch screen" },
      para("c41ac041d6b2", [span("50589e72d0e2", "This is Amazon’s…")]),
      para("22e9c9108964", [span("ec077ca24ace", "Then the next screen looks like it’s starting to load, until it jumps and gives you another flash as it goes back to an Amazon logo. Then it finally jumps back to the first page layout as it keeps loading in.")]),
      { ...by["row-loading"], caption: "3. Starts loading  ·  4. Amazon logo again  ·  5. Home page loads in" },
      para("c6b180543a82", [
        span("300474e895cd", "You may say, “Kaden, why are you so annoyed by a launch that takes less than 2 seconds?”\n\nThe little details matter to your"),
        span("525ed57240c7", " subconscious user experience", ["55bb209c8586"]),
        span("28904355ddc4", ". People judge how a design looks in as little as 50 milliseconds. For an app this big and used this often, a sub-two-second flicker is seen countless times a day, and it’s one of the easier things to fix."),
      ], by["c6b180543a82"].markDefs),
    ];
    const body3 = [para("fix", [span("fix-s", "Make the launch screen match the home page: a white background with the header bar’s shape, and no logo. Then the app looks like it opens straight into the store. Apple’s guidelines say the same thing, and it would make the app feel faster without changing how long it actually takes to load.")])];
    if (by["row-launch"] && by["row-loading"]) {
      await client.patch("redline-first-nitpick").set({
        title: "Amazon’s iOS app flickers when it opens",
        heading2: "For reference, here is a normal example of an app launch.",
        heading3: "How I’d fix it",
        body1, body3,
      }).commit();
      console.log("[seed] Applied the edits to the first nitpick.");
    }
  }
} catch (e) {
  console.log("[seed] Couldn't edit the first nitpick:", e.message);
}
