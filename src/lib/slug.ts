// Build SEO-friendly URL slugs like "toyota-highlander-xle-2020-a7867628"
// while still recovering the underlying UUID from the trailing segment.

const UUID_RE = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

export function slugify(text: string): string {
  return String(text || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function vehicleSlug(v: { id: string; name?: string | null; brand?: string | null; model?: string | null; year?: number | null }): string {
  const parts = [v.brand, v.model, v.year, v.name].filter(Boolean).join(" ");
  const base = slugify(parts || v.name || "vehicle");
  return base ? `${base}-${v.id}` : v.id;
}

export function extractId(param: string): string {
  const m = String(param || "").match(UUID_RE);
  return m ? m[0] : param;
}