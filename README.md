# Kaden Johnson · Portfolio

The cutting-mat portfolio, built with [Astro](https://astro.build) and deployed on Netlify.

## Run it locally

```sh
npm install
npm run dev      # http://localhost:4321
npm run build    # static site in dist/
```

## Where things live

- `src/data/projects.ts`: every card on the mat (projects, quotes, contact), categories, and image names
- `src/components/`: the cards, lightbox, before/after compare, 3D viewer, and helpers
- `src/components/bodies/`: the text of each project's lightbox (case studies)
- `src/scripts/`: filters, lightbox, rulers, compare slider, and the WebGL model viewer
- `src/styles/global.css`: all styles
- `public/images/`: portfolio images

To add a project, add an entry to `ITEMS` in `src/data/projects.ts`, put its image in `public/images/`, and (for a full case study) add a body component in `src/components/bodies/`.
