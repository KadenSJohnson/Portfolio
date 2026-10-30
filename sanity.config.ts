// Sanity Studio, built into dist/admin and served at /admin on the site
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { SANITY } from "./sanity.project.mjs";
import { schemaTypes, structure } from "./studio/schema";

export default defineConfig({
  name: "default",
  title: "Kaden Johnson · Portfolio",
  projectId: SANITY.projectId,
  dataset: SANITY.dataset,
  plugins: [structureTool({ structure })],
  schema: {
    types: schemaTypes,
    // "Site text" is a single document, so it isn't offered under "Create new"
    templates: (templates) => templates.filter((t) => t.schemaType !== "siteSettings"),
  },
  document: {
    actions: (actions, ctx) =>
      ctx.schemaType === "siteSettings" ? actions.filter((a) => !["duplicate", "delete", "unpublish"].includes(a.action ?? "")) : actions,
  },
});
