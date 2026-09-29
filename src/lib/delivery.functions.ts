import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

// Public (guest checkout must work), so keep abuse of the paid Google APIs in check.
const hits = new Map<string, number[]>();
function throttle(ip: string, max = 40, windowMs = 60_000) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < windowMs);
  if (recent.length >= max) throw new Error("Too many requests. Please wait a moment and try again.");
  recent.push(now);
  hits.set(ip, recent);
}

async function clientIp() {
  try {
    const { getRequestHeader } = await import("@tanstack/react-start/server");
    return (getRequestHeader("x-forwarded-for") || "").split(",")[0].trim() || "unknown";
  } catch {
    return "unknown";
  }
}

function mapsKey() {
  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key) throw new Error("Address lookup is not configured yet.");
  return key;
}

export type AddressSuggestion = { placeId: string; main: string; secondary: string; text: string };

export const suggestAddresses = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z.object({ input: z.string().trim().min(3).max(120), sessionToken: z.string().max(64).optional() }).parse(d),
  )
  .handler(async ({ data }): Promise<AddressSuggestion[]> => {
    throttle(await clientIp());
    const res = await fetch("https://places.googleapis.com/v1/places:autocomplete", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Goog-Api-Key": mapsKey() },
      body: JSON.stringify({
        input: data.input,
        sessionToken: data.sessionToken,
        includedRegionCodes: ["gh"],
        languageCode: "en",
      }),
    });
    if (!res.ok) {
      console.error("[delivery] autocomplete failed", res.status, await res.text());
      throw new Error("Could not load address suggestions.");
    }
    const json: any = await res.json();
    return (json.suggestions || [])
      .filter((s: any) => s.placePrediction)
      .slice(0, 6)
      .map((s: any) => {
        const p = s.placePrediction;
        return {
          placeId: p.placeId,
          main: p.structuredFormat?.mainText?.text || p.text?.text || "",
          secondary: p.structuredFormat?.secondaryText?.text || "",
          text: p.text?.text || "",
        };
      });
  });

export type DeliveryQuote = {
  quoteId: string;
  address: string;
  distanceKm: number;
  fee: number;
};

/**
 * Looks up the selected place, measures the road distance from the warehouse and stores a short-lived
 * quote. The fee shown here is a preview; the database trigger on `orders` recomputes the real fee from
 * the stored distance, so the browser can never set its own delivery charge.
 */
export const quoteDelivery = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        placeId: z.string().trim().min(5).max(300),
        sessionToken: z.string().max(64).optional(),
        subtotal: z.number().min(0).max(1e9),
      })
      .parse(d),
  )
  .handler(async ({ data }): Promise<DeliveryQuote> => {
    throttle(await clientIp(), 20);
    const key = mapsKey();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const db = supabaseAdmin as any;

    const { data: row } = await db.from("site_settings").select("value").eq("key", "delivery").maybeSingle();
    const cfg = row?.value;
    if (!cfg?.enabled) throw new Error("Delivery pricing is not enabled.");

    // Destination details
    const placeUrl = new URL(`https://places.googleapis.com/v1/places/${encodeURIComponent(data.placeId)}`);
    if (data.sessionToken) placeUrl.searchParams.set("sessionToken", data.sessionToken);
    const placeRes = await fetch(placeUrl, {
      headers: { "X-Goog-Api-Key": key, "X-Goog-FieldMask": "id,formattedAddress,displayName,location" },
    });
    if (!placeRes.ok) {
      console.error("[delivery] place lookup failed", placeRes.status, await placeRes.text());
      throw new Error("Could not read that location. Please pick another suggestion.");
    }
    const place: any = await placeRes.json();
    const lat = place.location?.latitude ?? null;
    const lng = place.location?.longitude ?? null;
    const name = place.displayName?.text;
    const formatted = place.formattedAddress || "";
    const address = name && !formatted.startsWith(name) ? `${name}, ${formatted}` : formatted;

    // Road distance from the warehouse
    const origin =
      typeof cfg.warehouse_lat === "number" && typeof cfg.warehouse_lng === "number"
        ? { location: { latLng: { latitude: cfg.warehouse_lat, longitude: cfg.warehouse_lng } } }
        : { address: String(cfg.warehouse_address || "Accra, Ghana") };
    const routeRes = await fetch("https://routes.googleapis.com/directions/v2:computeRoutes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": key,
        "X-Goog-FieldMask": "routes.distanceMeters",
      },
      body: JSON.stringify({
        origin,
        destination: { placeId: data.placeId },
        travelMode: "DRIVE",
        regionCode: "GH",
      }),
    });
    if (!routeRes.ok) {
      console.error("[delivery] route failed", routeRes.status, await routeRes.text());
      throw new Error("Could not calculate the delivery distance. Please try again.");
    }
    const route: any = await routeRes.json();
    const meters = route.routes?.[0]?.distanceMeters;
    if (typeof meters !== "number") throw new Error("No driving route found to that address.");
    const distanceKm = Math.ceil(meters / 100) / 10; // round up to 0.1 km

    const maxKm = Number(cfg.max_distance_km) || 0;
    if (maxKm > 0 && distanceKm > maxKm) {
      throw new Error(`Sorry, that address is ${distanceKm} km away, beyond our ${maxKm} km delivery range.`);
    }

    const { data: quote, error } = await db
      .from("delivery_quotes")
      .insert({ place_id: data.placeId, address, lat, lng, distance_km: distanceKm })
      .select("id")
      .single();
    if (error) throw new Error(error.message);

    const { data: fee, error: feeErr } = await db.rpc("compute_delivery_fee", {
      _distance_km: distanceKm,
      _subtotal: data.subtotal,
    });
    if (feeErr) throw new Error(feeErr.message);

    return { quoteId: quote.id, address, distanceKm, fee: Number(fee) };
  });
