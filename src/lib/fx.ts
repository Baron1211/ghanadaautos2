import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const DEFAULT_CAD_RATE = 8.5;

let cachedRate: number | null = null;
let inflight: Promise<number> | null = null;

export async function fetchCadRate(): Promise<number> {
  if (cachedRate != null) return cachedRate;
  if (inflight) return inflight;
  inflight = (async () => {
    const { data } = await supabase.from("site_settings").select("value").eq("key", "fx_rate").maybeSingle();
    const raw = (data?.value as any)?.cad_to_ghs ?? (data?.value as any)?.amount;
    const rate = Number(raw);
    cachedRate = rate > 0 ? rate : DEFAULT_CAD_RATE;
    return cachedRate;
  })();
  const r = await inflight;
  inflight = null;
  return r;
}

export function clearCadRateCache() {
  cachedRate = null;
  inflight = null;
}

/** 1 CAD = rate GHS. Returns the CAD equivalent of a GHS amount. */
export function ghsToCad(ghs: number | null | undefined, rate: number): number {
  const n = Number(ghs || 0);
  if (!n || !rate) return 0;
  return n / rate;
}

export function useCadRate(): number {
  const [rate, setRate] = useState<number>(cachedRate ?? DEFAULT_CAD_RATE);
  useEffect(() => {
    let alive = true;
    fetchCadRate().then((r) => { if (alive) setRate(r); });
    return () => { alive = false; };
  }, []);
  return rate;
}
