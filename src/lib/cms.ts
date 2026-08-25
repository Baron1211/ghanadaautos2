import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type CmsField = { key: string; label: string; type: "text" | "textarea" | "image" };
export type CmsGroup = { key: string; label: string; hint?: string; fields: CmsField[] };

export const CMS_GROUPS: CmsGroup[] = [
  {
    key: "home_hero",
    label: "Homepage hero",
    hint: "The big banner at the top of the homepage.",
    fields: [
      { key: "eyebrow", label: "Small label above the title", type: "text" },
      { key: "title_line1", label: "Title — line 1", type: "text" },
      { key: "title_line2", label: "Title — line 2", type: "text" },
      { key: "cta_label", label: "Button label", type: "text" },
      { key: "stat1_value", label: "Stat 1 value", type: "text" },
      { key: "stat1_label", label: "Stat 1 label", type: "text" },
      { key: "stat2_value", label: "Stat 2 value", type: "text" },
      { key: "stat2_label", label: "Stat 2 label", type: "text" },
      { key: "stat3_value", label: "Stat 3 value", type: "text" },
      { key: "stat3_label", label: "Stat 3 label", type: "text" },
      { key: "stat4_value", label: "Stat 4 value", type: "text" },
      { key: "stat4_label", label: "Stat 4 label", type: "text" },
    ],
  },
  {
    key: "home_sections",
    label: "Homepage section headings",
    fields: [
      { key: "services_eyebrow", label: "Services — label", type: "text" },
      { key: "services_title", label: "Services — heading", type: "text" },
      { key: "vehicles_eyebrow", label: "Vehicles — label", type: "text" },
      { key: "vehicles_title", label: "Vehicles — heading", type: "text" },
      { key: "parts_eyebrow", label: "Spare parts — label", type: "text" },
      { key: "parts_title", label: "Spare parts — heading", type: "text" },
      { key: "rentals_eyebrow", label: "Rentals — label", type: "text" },
      { key: "rentals_title", label: "Rentals — heading", type: "text" },
      { key: "import_eyebrow", label: "Import — label", type: "text" },
      { key: "import_title", label: "Import — heading", type: "text" },
    ],
  },
  {
    key: "repairs_page",
    label: "Repairs page",
    fields: [
      { key: "eyebrow", label: "Small label", type: "text" },
      { key: "title", label: "Heading", type: "text" },
      { key: "subtitle", label: "Sub heading", type: "textarea" },
      { key: "form_title", label: "Form heading", type: "text" },
      { key: "form_intro", label: "Form intro text", type: "textarea" },
    ],
  },
  {
    key: "tracking_page",
    label: "Tracking page",
    fields: [
      { key: "title", label: "Heading", type: "text" },
      { key: "subtitle", label: "Sub heading", type: "textarea" },
    ],
  },
];

export const CMS_DEFAULTS: Record<string, Record<string, string>> = {
  home_hero: {
    eyebrow: "Ghana's Complete Automotive Company",
    title_line1: "Your Complete",
    title_line2: "Automotive Partner",
    cta_label: "Browse Cars →",
    stat1_value: "10+", stat1_label: "Years Experience",
    stat2_value: "500+", stat2_label: "Cars Sold",
    stat3_value: "2,500+", stat3_label: "Satisfied Customers",
    stat4_value: "24/7", stat4_label: "Customer Support",
  },
  home_sections: {
    services_eyebrow: "What We Do",
    services_title: "One company, every automotive need",
    vehicles_eyebrow: "Featured Vehicles",
    vehicles_title: "Find your next car",
    parts_eyebrow: "Shop Spare Parts",
    parts_title: "Genuine parts, guaranteed fit",
    rentals_eyebrow: "Car Rentals",
    rentals_title: "Rent a Car",
    import_eyebrow: "🇨🇦 Import From Canada",
    import_title: "Import your dream vehicle from Canada",
  },
  repairs_page: {
    eyebrow: "Auto Repairs & Diagnostics",
    title: "Certified technicians. Transparent pricing.",
    subtitle: "Factory-trained across all major brands. Most jobs done within 24 hours.",
    form_title: "Request a Repair",
    form_intro: "Tell us the vehicle and the part you want repaired — our team reviews every request and contacts you with a quote.",
  },
  tracking_page: {
    title: "Track your shipment",
    subtitle: "Enter the tracking number we sent you to see the current status, location and updates.",
  },
};

const cache = new Map<string, Record<string, string>>();

export async function fetchContentGroup(group: string): Promise<Record<string, string>> {
  if (cache.has(group)) return cache.get(group)!;
  const { data } = await supabase.from("site_content").select("value").eq("key", group).maybeSingle();
  const merged = { ...(CMS_DEFAULTS[group] || {}), ...((data?.value as any) || {}) };
  Object.keys(merged).forEach((k) => { if (merged[k] === "" || merged[k] == null) merged[k] = (CMS_DEFAULTS[group] || {})[k] ?? ""; });
  cache.set(group, merged);
  return merged;
}

export function clearContentCache() { cache.clear(); }

/** Returns a getter for CMS text with built-in defaults; safe during SSR. */
export function useContent(group: string) {
  const [values, setValues] = useState<Record<string, string>>(cache.get(group) ?? CMS_DEFAULTS[group] ?? {});
  useEffect(() => {
    let alive = true;
    fetchContentGroup(group).then((v) => { if (alive) setValues(v); });
    return () => { alive = false; };
  }, [group]);
  return (key: string) => values[key] ?? CMS_DEFAULTS[group]?.[key] ?? "";
}
