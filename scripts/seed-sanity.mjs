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
const client = createClient({ projectId: SANITY.projectId, dataset: SANITY.dataset, apiVersion: SANITY.apiVersion, token, useCdn: false });

const tx = client.transaction();
tx.createIfNotExists({ _id: "siteSettings", _type: "siteSettings", ...settings });
for (const { id, ...p } of projects) {
  tx.createIfNotExists(strip({ _id: `project-${id}`, _type: "project", slug: { _type: "slug", current: id }, ...p }));
}
for (const { id, ...t } of testimonials) {
  tx.createIfNotExists(strip({ _id: `testimonial-${id}`, _type: "testimonial", ...t }));
}
try {
  await tx.commit();
  console.log(`[seed] Copied site text, ${projects.length} projects and ${testimonials.length} testimonials into Sanity (existing documents were left alone).`);
} catch (e) {
  console.error("[seed] Couldn't write to Sanity:", e.message);
  process.exit(1);
}
