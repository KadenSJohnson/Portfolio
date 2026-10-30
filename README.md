# Kaden Johnson · Portfolio

The cutting-mat portfolio, built with [Astro](https://astro.build) and deployed on Netlify.

## Run it locally

```sh
npm install
npm run dev      # http://localhost:4321
npm run build    # static site in dist/
```

## Editing text (Sanity)

The site text, projects, case studies and testimonials can be edited in Sanity Studio at `/admin`
(for example kadenjohnson.me/admin). Publishing in the Studio doesn't change the live site until
Netlify rebuilds it: a Sanity webhook that calls a Netlify build hook does that automatically.

- `sanity.project.mjs`: the Sanity project ID and dataset
- `studio/schema.ts`: what's editable in the Studio
- `src/lib/content.ts`: loads the content at build time, and falls back to `src/data/local.ts`
  when Sanity isn't set up or can't be reached
- `scripts/seed-sanity.mjs`: one-time copy of `src/data/local.ts` into Sanity. It runs during the
  build only when the `SANITY_WRITE_TOKEN` environment variable is set in Netlify, and never
  overwrites documents that already exist.

The KPM before/after compare and the 3D models are built in code and attach to the projects with
the slugs `kpm` and `flint`, so keep those slugs as they are.

## Where things live

- `src/data/local.ts`: the content (also the fallback when Sanity isn't available)
- `src/data/projects.ts`: categories, image file names, and the code-built features (compare, 3D models)
- `src/components/`: the cards, lightbox, before/after compare, 3D viewer, and helpers
- `src/components/RichText.astro`: renders the lightbox text (Portable Text)
- `src/scripts/`: filters, lightbox, rulers, compare slider, and the WebGL model viewer
- `src/styles/global.css`: all styles
- `public/images/`: portfolio images

To add a project, create it in the Studio (or add it to `src/data/local.ts` when Sanity isn't set up).
