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

// One-time: regroup the first nitpick's screenshots into two side-by-side rows (text unchanged,
// only the order). Skipped if the nitpick has been edited since.
try {
  const d = await client.fetch(`*[_id == "redline-first-nitpick"][0]{_updatedAt, body1}`);
  if (d && d._updatedAt === "2026-10-29T23:36:33Z") {
    const by = Object.fromEntries((d.body1 || []).map((b) => [b._key, b]));
    const pic = (k) => ({ _type: "image", _key: by[k]._key, asset: by[k].image.asset, alt: by[k].alt });
    const row = (key, ks) => ({ _type: "rtGallery", _key: key, frame: "phone", images: ks.map(pic) });
    const body1 = [
      by["1pvi4owy"], by["7fab612b4aa0"],
      row("row-launch", ["0d7f60726a23", "f12dd7b79891"]),
      by["c41ac041d6b2"], by["22e9c9108964"], by["c0c01c5b69af"],
      row("row-loading", ["f3fdea6c3289", "b02f329782f5", "22b19a63462b"]),
      by["c6b180543a82"],
    ];
    if (body1.every(Boolean)) {
      await client.patch("redline-first-nitpick").set({ body1 }).commit();
      console.log("[seed] Regrouped the first nitpick's screenshots into rows.");
    }
  }
} catch (e) {
  console.log("[seed] Couldn't regroup the first nitpick:", e.message);
}
