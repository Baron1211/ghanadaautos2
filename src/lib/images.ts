// Utilities for handling multi-image galleries with per-image captions.
// Images may be stored as legacy string[] or as [{url, caption}]. Normalize on read.

export type GalleryImage = { url: string; caption: string };

export const MAX_IMAGES = 10;

export function normalizeImages(raw: any, fallbackUrl?: string | null): GalleryImage[] {
  const out: GalleryImage[] = [];
  if (Array.isArray(raw)) {
    for (const item of raw) {
      if (!item) continue;
      if (typeof item === "string") out.push({ url: item, caption: "" });
      else if (typeof item === "object" && typeof item.url === "string") {
        out.push({ url: item.url, caption: typeof item.caption === "string" ? item.caption : "" });
      }
    }
  }
  if (!out.length && fallbackUrl) out.push({ url: fallbackUrl, caption: "" });
  return out;
}

export function serializeImages(list: GalleryImage[]): GalleryImage[] {
  return list.slice(0, MAX_IMAGES).filter((i) => i.url).map((i) => ({ url: i.url, caption: i.caption || "" }));
}