// Loads the editable content at build time: from Sanity when a project is set up and has content,
// otherwise from src/data/local.ts. A Sanity error never breaks the build; it falls back to local.
import { SANITY } from "../../sanity.project.mjs";
import * as local from "../data/local";
import type { Project, Settings, Testimonial, Redline, SanityImage } from "../data/local";

export type { Project, Settings, Testimonial, Redline, Block } from "../data/local";

const QUERY = `{
  "settings": *[_id == "siteSettings"][0]{headline, headlineMuted, bio, email, linkedin, x, contactForm, contactHeading, contactLede},
  "projects": *[_type == "project"] | order(order asc){
    "id": slug.current, "docId": _id, order, title, subtitle, categories, imageFile, image, "coverVideo": coverVideo.asset->url, imageLabel, imageRatio, body
  },
  "testimonials": *[_type == "testimonial"] | order(order asc){
    "id": _id, order, ask, quote, name, role, photoFile, logoFile, photo, logo, tilt
  },
  "redlines": *[_type == "redline"] | order(date desc){
    "id": coalesce(slug.current, _id), date, app, title, device, "video": coalesce(videoUpload.asset->url, videoFile), "image": imageFile, "imageAsset": image,
    "poster": select(defined(videoUpload.asset) => null, poster), alt, focus, zoom, mark, heading1, "body1": body1[]{..., _type == "rtVideo" => {"url": file.asset->url}}, heading2, "body2": body2[]{..., _type == "rtVideo" => {"url": file.asset->url}}, heading3, "body3": body3[]{..., _type == "rtVideo" => {"url": file.asset->url}}, "fixImageAsset": fixImageUpload, "fixVideo": fixVideoUpload.asset->url
  }
}`;

const clean = <T extends object>(o: T | null | undefined) =>
  Object.fromEntries(Object.entries(o || {}).filter(([, v]) => v !== null && v !== undefined && v !== "")) as Partial<T>;

let cache: Promise<{ settings: Settings; projects: Project[]; testimonials: Testimonial[]; redlines: Redline[]; source: string }> | null = null;

export function getContent() {
  if (cache) return cache;
  cache = (async () => {
    const fallback = { settings: local.settings, projects: local.projects, testimonials: local.testimonials, redlines: local.redlines, source: "local" };
    if (!SANITY.projectId) return fallback;
    try {
      const url = `https://${SANITY.projectId}.api.sanity.io/v${SANITY.apiVersion}/data/query/${SANITY.dataset}?query=${encodeURIComponent(QUERY)}&perspective=published`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Sanity responded ${res.status}`);
      const { result } = await res.json();
      const projects: Project[] = (result.projects || []).filter((p: Project) => p.id).map((p: Project) => ({
        ...p, categories: p.categories || [], tilt: p.tilt ?? 0, body: p.body || [], material: p.material || "paper",
      }));
      if (!projects.length) {
        console.warn("[content] Sanity has no projects yet; using src/data/local.ts");
        return fallback;
      }
      console.log(`[content] Loaded ${projects.length} projects from Sanity`);
      return {
        settings: { ...local.settings, ...clean(result.settings) },
        projects,
        testimonials: (result.testimonials || []).map((t: Testimonial) => ({ ...t, tilt: t.tilt ?? 0 })),
        redlines: (result.redlines || []).filter((r: Redline) => r.id).length ? result.redlines.filter((r: Redline) => r.id) : local.redlines,
        source: "sanity",
      };
    } catch (e) {
      console.warn("[content] Couldn't load Sanity content, using src/data/local.ts:", (e as Error).message);
      return fallback;
    }
  })();
  return cache;
}

// URL for an uploaded Sanity image, or the bundled file in public/images
export function imageUrl(image: SanityImage | undefined, file: string | null | undefined, fileToPath: (f: string) => string, width = 1600) {
  const ref = image?.asset?._ref;
  if (ref && SANITY.projectId) {
    const m = ref.match(/^image-([a-zA-Z0-9]+)-(\d+x\d+)-(\w+)$/);
    if (m) return `https://cdn.sanity.io/images/${SANITY.projectId}/${SANITY.dataset}/${m[1]}-${m[2]}.${m[3]}?w=${width}&fit=max&auto=format`;
  }
  return file ? fileToPath(file) : null;
}
