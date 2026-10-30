// srcset for an image: smaller copies of bundled images (made ahead of time, listed in
// image-variants.json) or Sanity's resized versions of uploaded ones
import variants from "../data/image-variants.json";
import { SANITY } from "../../sanity.project.mjs";
import type { SanityImage } from "../data/local";

export const CARD_SIZES = "(min-width: 1200px) 31vw, (min-width: 720px) 48vw, 100vw";

export function srcsetFor(url: string, image?: SanityImage, width?: number) {
  if (image?.asset?._ref && url.includes("cdn.sanity.io")) {
    const base = url.replace(/[?&]w=\d+/, "").replace(/\?&/, "?");
    const join = base.includes("?") ? "&" : "?";
    return [600, 1000, 1600, 2400].filter((w) => !width || w <= width).map((w) => `${base}${join}w=${w} ${w}w`).join(", ") || undefined;
  }
  const m = url.match(/^\/images\/(.+)$/);
  if (!m) return undefined;
  const file = decodeURIComponent(m[1]);
  const ws = (variants as Record<string, number[]>)[file];
  if (!ws || !width) return undefined;
  const stem = file.replace(/\.[^.]+$/, "");
  return [...ws.map((w) => `/images/${stem}-${w}.webp ${w}w`), `${url} ${width}w`].join(", ");
}
