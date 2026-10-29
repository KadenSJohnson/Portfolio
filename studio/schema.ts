// Sanity Studio content model for the portfolio. Text and images are editable here; layout features
// (the KPM before/after and the 3D models) stay in code and attach by the project's slug.
import { defineArrayMember, defineField, defineType } from "sanity";
import type { StructureResolver } from "sanity/structure";

const CATEGORY_OPTIONS = [
  { title: "UX/UI Design", value: "uxui" },
  { title: "Icon Design", value: "icon" },
  { title: "App Icon", value: "app" },
  { title: "Tools", value: "tools" },
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
      description: "The project's ID in links (#slug). Keep kpm and flint as they are: the compare slider and video attach by slug." }),
    defineField({ name: "order", type: "number", description: "Position in the gallery, smallest first. Testimonials share the same numbering." }),
    defineField({ name: "categories", type: "array", of: [{ type: "string" }], options: { list: CATEGORY_OPTIONS, layout: "grid" } }),
    defineField({ name: "wide", title: "Wide card", type: "boolean", initialValue: false }),
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
    defineField({ name: "ask", title: "Your message to them", type: "string", description: "Kaden's opening text in the Messages animation. Keep it short enough for one line.", validation: (r) => r.max(40) }),
    defineField({ name: "quote", type: "text", rows: 4, validation: (r) => r.required() }),
    defineField({ name: "name", type: "string" }),
    defineField({ name: "role", type: "string" }),
    defineField({ name: "order", type: "number", description: "Position in the gallery, smallest first." }),
    defineField({ name: "photo", type: "image" }),
    imageFileField("photoFile", "Photo file"),
    defineField({ name: "logo", type: "image" }),
    imageFileField("logoFile", "Logo file"),
  ],
  orderings: [{ title: "Gallery order", name: "order", by: [{ field: "order", direction: "asc" }] }],
  preview: { select: { title: "name", subtitle: "quote", media: "photo" } },
});

const redline = defineType({
  name: "redline", title: "Redline", type: "document",
  fields: [
    defineField({ name: "title", type: "string", description: "What went wrong, in a few words." }),
    defineField({ name: "slug", type: "slug", options: { source: "title" } }),
    defineField({ name: "app", title: "App or site", type: "string" }),
    defineField({ name: "date", type: "date" }),
    defineField({ name: "device", title: "Frame", type: "string", initialValue: "phone",
      options: { list: [{ title: "iPhone", value: "phone" }, { title: "Laptop", value: "desktop" }, { title: "Close crop", value: "crop" }], layout: "radio" } }),
    defineField({ name: "videoUpload", title: "Video", type: "file", options: { accept: "video/mp4,video/quicktime" }, description: "A screen recording. MP4 plays everywhere." }),
    defineField({ name: "image", type: "image", description: "Use this instead of a video for a screenshot." }),
    defineField({ name: "alt", title: "Describe the image or clip", type: "string" }),
    defineField({ name: "focus", title: "Crop focus", type: "string", description: "Close crop only: where to zoom, like 50% 20% (left-right, top-bottom)." }),
    defineField({ name: "zoom", title: "Crop zoom", type: "number", description: "Close crop only: 1 shows everything, 2 is twice as close." }),
    defineField({ name: "mark", title: "Selection box", type: "object", description: "Optional box drawn over the problem, in % of the screen.", fields: [
      defineField({ name: "x", type: "number" }), defineField({ name: "y", type: "number" }),
      defineField({ name: "w", title: "Width", type: "number" }), defineField({ name: "h", title: "Height", type: "number" }),
    ] }),
    defineField({ name: "problem", title: "What I noticed", type: "text", rows: 3 }),
    defineField({ name: "why", title: "Why it matters", type: "text", rows: 2 }),
    defineField({ name: "fix", title: "How I'd fix it", type: "text", rows: 2 }),
    defineField({ name: "videoFile", title: "Video file on the site", type: "string", hidden: true }),
    defineField({ name: "imageFile", title: "Image file on the site", type: "string", hidden: true }),
    defineField({ name: "poster", type: "string", hidden: true }),
  ],
  orderings: [{ title: "Newest first", name: "date", by: [{ field: "date", direction: "desc" }] }],
  preview: { select: { title: "title", subtitle: "app", media: "image" } },
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

export const schemaTypes = [siteSettings, project, testimonial, redline, metaTable, stats, figures, pullQuote, problemSolution];

export const structure: StructureResolver = (S) =>
  S.list().title("Portfolio").items([
    S.listItem().title("Site text").id("siteSettings").child(S.document().schemaType("siteSettings").documentId("siteSettings")),
    S.divider(),
    S.listItem().title("Projects").schemaType("project").child(S.documentTypeList("project").title("Projects").defaultOrdering([{ field: "order", direction: "asc" }])),
    S.listItem().title("Testimonials").schemaType("testimonial").child(S.documentTypeList("testimonial").title("Testimonials").defaultOrdering([{ field: "order", direction: "asc" }])),
    S.listItem().title("Redlines").schemaType("redline").child(S.documentTypeList("redline").title("Redlines").defaultOrdering([{ field: "date", direction: "desc" }])),
  ]);
