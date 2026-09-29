import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/settings")({
  component: AdminSettings,
});

function AdminSettings() {
  const [driverFee, setDriverFee] = useState("40");
  const [contact, setContact] = useState({ phone_ca: "", phone_gh: "", whatsapp: "", address_ca: "", address_gh: "", email: "" });
  const [hero, setHero] = useState({ eyebrow: "", title: "", subtitle: "" });
  const [delivery, setDelivery] = useState({
    enabled: false, warehouse_address: "Accra, Ghana", warehouse_lat: "", warehouse_lng: "",
    base_fee: "20", per_km: "4", free_threshold: "0", max_distance_km: "0", zones: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("site_settings").select("*");
      data?.forEach((r: any) => {
        if (r.key === "driver_daily_fee") setDriverFee(String(r.value.amount ?? 40));
        if (r.key === "contact") setContact({ ...contact, ...r.value });
        if (r.key === "delivery") {
          const v = r.value || {};
          setDelivery({
            enabled: !!v.enabled,
            warehouse_address: v.warehouse_address ?? "",
            warehouse_lat: v.warehouse_lat == null ? "" : String(v.warehouse_lat),
            warehouse_lng: v.warehouse_lng == null ? "" : String(v.warehouse_lng),
            base_fee: String(v.base_fee ?? 0), per_km: String(v.per_km ?? 0),
            free_threshold: String(v.free_threshold ?? 0), max_distance_km: String(v.max_distance_km ?? 0),
            zones: (v.zones || []).map((z: any) => z.max_km + ":" + z.fee).join(", "),
          });
        }
        if (r.key === "hero") setHero({ ...hero, ...r.value });
      });
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const save = async () => {
    const zones = delivery.zones.split(",").map(z => z.trim()).filter(Boolean).map(z => {
      const [km, fee] = z.split(":").map(Number);
      return { max_km: km, fee };
    });
    if (zones.some(z => !Number.isFinite(z.max_km) || !Number.isFinite(z.fee) || z.max_km <= 0 || z.fee < 0)) {
      toast.error("Zones must look like 5:30, 15:60 (up to km : fee)"); return;
    }
    const num = (v: string) => { const n = Number(v); return Number.isFinite(n) && n >= 0 ? n : 0; };
    const lat = delivery.warehouse_lat.trim() === "" ? null : Number(delivery.warehouse_lat);
    const lng = delivery.warehouse_lng.trim() === "" ? null : Number(delivery.warehouse_lng);
    setSaving(true);
    const rows = [
      { key: "driver_daily_fee", value: { amount: Number(driverFee), currency: "GHS" } },
      { key: "delivery", value: {
        enabled: delivery.enabled, warehouse_address: delivery.warehouse_address.trim(),
        warehouse_lat: Number.isFinite(lat) ? lat : null, warehouse_lng: Number.isFinite(lng) ? lng : null,
        base_fee: num(delivery.base_fee), per_km: num(delivery.per_km),
        free_threshold: num(delivery.free_threshold), max_distance_km: num(delivery.max_distance_km), zones,
      } },
      { key: "contact", value: contact },
      { key: "hero", value: hero },
    ];
    const { error } = await supabase.from("site_settings").upsert(rows);
    setSaving(false);
    if (error) toast.error(error.message);
    else { toast.success("Settings saved"); }
  };

  return (
    <>
      <h1>Site Settings</h1>

      <div className="ga-admin-form">
        <h3>Rental driver fee</h3>
        <div className="ga-form-grid">
          <label>Driver daily fee (GHS)<input type="number" step="0.01" value={driverFee} onChange={e => setDriverFee(e.target.value)} /></label>
        </div>
      </div>


      <div className="ga-admin-form">
        <h3>Delivery pricing</h3>
        <p className="ga-muted">Customers pick their address at checkout; the fee is worked out from the road distance to it. Requires the GOOGLE_MAPS_API_KEY server secret.</p>
        <div className="ga-form-grid">
          <label>Automatic delivery pricing
            <select value={delivery.enabled ? "on" : "off"} onChange={e => setDelivery({ ...delivery, enabled: e.target.value === "on" })}>
              <option value="off">Off (manual address, no fee)</option>
              <option value="on">On</option>
            </select>
          </label>
          <label className="ga-form-full">Warehouse / dispatch address<input value={delivery.warehouse_address} onChange={e => setDelivery({ ...delivery, warehouse_address: e.target.value })} /></label>
          <label>Warehouse latitude (optional)<input value={delivery.warehouse_lat} onChange={e => setDelivery({ ...delivery, warehouse_lat: e.target.value })} /></label>
          <label>Warehouse longitude (optional)<input value={delivery.warehouse_lng} onChange={e => setDelivery({ ...delivery, warehouse_lng: e.target.value })} /></label>
          <label>Base fee (GHS)<input type="number" min="0" step="0.01" value={delivery.base_fee} onChange={e => setDelivery({ ...delivery, base_fee: e.target.value })} /></label>
          <label>Price per km (GHS)<input type="number" min="0" step="0.01" value={delivery.per_km} onChange={e => setDelivery({ ...delivery, per_km: e.target.value })} /></label>
          <label>Free delivery from order total (0 = never)<input type="number" min="0" step="0.01" value={delivery.free_threshold} onChange={e => setDelivery({ ...delivery, free_threshold: e.target.value })} /></label>
          <label>Maximum delivery distance, km (0 = no limit)<input type="number" min="0" step="0.1" value={delivery.max_distance_km} onChange={e => setDelivery({ ...delivery, max_distance_km: e.target.value })} /></label>
          <label className="ga-form-full">Flat-fee zones (optional) — up to km : fee, e.g. 5:30, 15:60. Beyond the last zone the base + per-km rate applies.<input value={delivery.zones} onChange={e => setDelivery({ ...delivery, zones: e.target.value })} placeholder="5:30, 15:60" /></label>
        </div>
      </div>

      <div className="ga-admin-form">
        <h3>Contact info</h3>
        <div className="ga-form-grid">
          <label>Phone (China)<input value={contact.phone_ca} onChange={e => setContact({ ...contact, phone_ca: e.target.value })} /></label>
          <label>Phone (Ghana)<input value={contact.phone_gh} onChange={e => setContact({ ...contact, phone_gh: e.target.value })} /></label>
          <label>WhatsApp<input value={contact.whatsapp} onChange={e => setContact({ ...contact, whatsapp: e.target.value })} /></label>
          <label>Email<input value={contact.email} onChange={e => setContact({ ...contact, email: e.target.value })} /></label>
          <label>Address (China)<input value={contact.address_ca} onChange={e => setContact({ ...contact, address_ca: e.target.value })} /></label>
          <label>Address (Ghana)<input value={contact.address_gh} onChange={e => setContact({ ...contact, address_gh: e.target.value })} /></label>
        </div>
      </div>

      <div className="ga-admin-form">
        <h3>Homepage hero</h3>
        <div className="ga-form-grid">
          <label>Eyebrow<input value={hero.eyebrow} onChange={e => setHero({ ...hero, eyebrow: e.target.value })} /></label>
          <label>Title<input value={hero.title} onChange={e => setHero({ ...hero, title: e.target.value })} /></label>
          <label className="ga-form-full">Subtitle<textarea value={hero.subtitle} onChange={e => setHero({ ...hero, subtitle: e.target.value })} /></label>
        </div>
      </div>

      <button className="ga-btn-primary" onClick={save} disabled={saving}>{saving ? "Saving…" : "Save all settings"}</button>
    </>
  );
}