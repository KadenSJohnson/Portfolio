// Sanity Studio content model for the portfolio. Text and images are editable here; layout features
// (the KPM before/after and the 3D models) stay in code and attach by the project's slug.
import { defineArrayMember, defineField, defineType } from "sanity";
import type { StructureResolver } from "sanity/structure";

const CATEGORY_OPTIONS = [
  { title: "UX/UI Design", value: "uxui" },
  { title: "Icon Design", value: "icon" },
  { title: "App Icon", value: "app" },
  { title: "3D Design", value: "3d" },
  { title: "Other Design", value: "other" },
];

const imageFileField = (name: string, title: string) =>
  defineField({ name, title, type: "string", description: "A file already on the site (public/images). An uploaded image above takes its place." });

const metaTable = defineType({
  name: "metaTable", title: "Details table", type: "object",
  fields: [defineField({ name: "rows", type: "array", of: [defineArrayMember({ type: "object", name: "row", fields: [
    defineField({ name: "label", type: "string" }), defineField({ name: "value", type: "string" }),
  ], preview: { select: { title: "label", subtitle: "value" } } })] })],
  preview: { select: { rows: "rows" }, prepare: ({ rows }) => ({ title: "Details table", subtitle: (rows || []).map((r: any) => r.label).join(" · ") }) },
});

const stats = defineType({
  name: "stats", title: "Stats", type: "object",
  fields: [defineField({ name: "items", type: "array", of: [defineArrayMember({ type: "object", name: "stat", fields: [
    defineField({ name: "num", title: "Number", type: "string" }),
    defineField({ name: "label", type: "string" }),
    defineField({ name: "detail", type: "string" }),
  ], preview: { select: { title: "num", subtitle: "label" } } })] })],
  preview: { select: { items: "items" }, prepare: ({ items }) => ({ title: "Stats", subtitle: (items || []).map((s: any) => s.num).join(" · ") }) },
});

const figures = defineType({
  name: "figures", title: "Images", type: "object",
  fields: [
    defineField({ name: "cols", title: "Columns", type: "number", options: { list: [1, 2], layout: "radio" }, initialValue: 2 }),
    defineField({ name: "items", type: "array", of: [defineArrayMember({ type: "object", name: "figure", fields: [
      defineField({ name: "image", type: "image" }),
      imageFileField("imageFile", "Image file"),
      defineField({ name: "label", title: "Caption", type: "string" }),
    ], preview: { select: { title: "label", subtitle: "imageFile", media: "image" } } })] }),
  ],
  preview: { select: { items: "items" }, prepare: ({ items }) => ({ title: "Images", subtitle: (items || []).map((f: any) => f.label).join(" · ") }) },
});

const pullQuote = defineType({
  name: "pullQuote", title: "Pull quote", type: "object",
  fields: [defineField({ name: "text", type: "text", rows: 3 }), defineField({ name: "cite", title: "Who said it", type: "string" })],
  preview: { select: { title: "text", subtitle: "cite" } },
});

const problemSolution = defineType({
  name: "problemSolution", title: "Problem and solution", type: "object",
  fields: [defineField({ name: "problem", type: "string" }), defineField({ name: "solution", type: "string" })],
  preview: { select: { title: "problem", subtitle: "solution" } },
});

const richText = defineArrayMember({
  type: "block",
  styles: [
    { title: "Normal", value: "normal" },
    { title: "Lead (larger intro)", value: "lead" },
    { title: "Note (to-do)", value: "note" },
    { title: "Section heading", value: "h3" },
  ],
  lists: [],
  marks: {
    decorators: [{ title: "Bold", value: "strong" }, { title: "Italic", value: "em" }],
    annotations: [{ name: "link", type: "object", title: "Link", fields: [defineField({ name: "href", type: "url", title: "URL" })] }],
  },
});

const project = defineType({
  name: "project", title: "Project", type: "document",
  fields: [
    defineField({ name: "title", type: "string", validation: (r) => r.required() }),
    defineField({ name: "subtitle", type: "string", description: "One line under the title on the card." }),
    defineField({ name: "slug", type: "slug", options: { source: "title" }, validation: (r) => r.required(),
      description: "The project's ID in links (#slug). Keep kpm, low-poly-kiwi and knapped-rock as they are: the compare slider and 3D models attach by slug." }),
    defineField({ name: "order", type: "number", description: "Position in the gallery, smallest first. Testimonials share the same numbering." }),
    defineField({ name: "categories", type: "array", of: [{ type: "string" }], options: { list: CATEGORY_OPTIONS, layout: "grid" } }),
    defineField({ name: "material", title: "Card material", type: "string", options: { list: ["paper", "metal", "acrylic", "stock"], layout: "radio", direction: "horizontal" }, initialValue: "paper" }),
    defineField({ name: "wide", title: "Wide card", type: "boolean", initialValue: false }),
    defineField({ name: "tilt", title: "Tilt (degrees)", type: "number", initialValue: 0, description: "A small rotation, like -1.2 or 0.8." }),
    defineField({ name: "image", title: "Card image", type: "image", options: { hotspot: true } }),
    imageFileField("imageFile", "Card image file"),
    defineField({ name: "imageLabel", title: "Image description", type: "string", description: "Alt text, and the label when there's no image yet." }),
    defineField({ name: "imageRatio", title: "Card image shape", type: "string", options: { list: ["4/3", "16/9", "1/1", "16/10"], layout: "radio", direction: "horizontal" }, initialValue: "4/3" }),
    defineField({ name: "body", title: "Lightbox text", type: "array", of: [richText, { type: "metaTable" }, { type: "stats" }, { type: "figures" }, { type: "pullQuote" }, { type: "problemSolution" }] }),
  ],
  orderings: [{ title: "Gallery order", name: "order", by: [{ field: "order", direction: "asc" }] }],
  preview: { select: { title: "title", subtitle: "subtitle", media: "image" } },
});

const testimonial = defineType({
  name: "testimonial", title: "Testimonial", type: "document",
  fields: [
    defineField({ name: "quote", type: "text", rows: 4, validation: (r) => r.required() }),
    defineField({ name: "name", type: "string" }),
    defineField({ name: "role", type: "string" }),
    defineField({ name: "order", type: "number", description: "Position in the gallery, smallest first." }),
    defineField({ name: "tilt", title: "Tilt (degrees)", type: "number", initialValue: 0 }),
    defineField({ name: "photo", type: "image" }),
    imageFileField("photoFile", "Photo file"),
    defineField({ name: "logo", type: "image" }),
    imageFileField("logoFile", "Logo file"),
  ],
  orderings: [{ title: "Gallery order", name: "order", by: [{ field: "order", direction: "asc" }] }],
  preview: { select: { title: "name", subtitle: "quote", media: "photo" } },
});

const siteSettings = defineType({
  name: "siteSettings", title: "Site text", type: "document",
  fields: [
    defineField({ name: "headline", type: "string" }),
    defineField({ name: "headlineMuted", title: "Headline, grey part", type: "string" }),
    defineField({ name: "bio", type: "text", rows: 3 }),
    defineField({ name: "email", type: "string" }),
    defineField({ name: "linkedin", title: "LinkedIn URL", type: "url" }),
    defineField({ name: "x", title: "X URL", type: "url" }),
    defineField({ name: "contactForm", title: "Contact form URL", type: "url" }),
    defineField({ name: "contactHeading", title: "Contact card heading", type: "string" }),
    defineField({ name: "contactLede", title: "Contact card line", type: "string" }),
  ],
  preview: { prepare: () => ({ title: "Site text" }) },
});

export const schemaTypes = [siteSettings, project, testimonial, metaTable, stats, figures, pullQuote, problemSolution];

export const structure: StructureResolver = (S) =>
  S.list().title("Portfolio").items([
    S.listItem().title("Site text").id("siteSettings").child(S.document().schemaType("siteSettings").documentId("siteSettings")),
    S.divider(),
    S.listItem().title("Projects").schemaType("project").child(S.documentTypeList("project").title("Projects").defaultOrdering([{ field: "order", direction: "asc" }])),
    S.listItem().title("Testimonials").schemaType("testimonial").child(S.documentTypeList("testimonial").title("Testimonials").defaultOrdering([{ field: "order", direction: "asc" }])),
  ]);
