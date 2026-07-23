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
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("site_settings").select("*");
      data?.forEach((r: any) => {
        if (r.key === "driver_daily_fee") setDriverFee(String(r.value.amount ?? 40));
        if (r.key === "contact") setContact({ ...contact, ...r.value });
        if (r.key === "hero") setHero({ ...hero, ...r.value });
      });
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const save = async () => {
    setSaving(true);
    const rows = [
      { key: "driver_daily_fee", value: { amount: Number(driverFee), currency: "CAD" } },
      { key: "contact", value: contact },
      { key: "hero", value: hero },
    ];
    const { error } = await supabase.from("site_settings").upsert(rows);
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success("Settings saved");
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
        <h3>Contact info</h3>
        <div className="ga-form-grid">
          <label>Phone (Canada)<input value={contact.phone_ca} onChange={e => setContact({ ...contact, phone_ca: e.target.value })} /></label>
          <label>Phone (Ghana)<input value={contact.phone_gh} onChange={e => setContact({ ...contact, phone_gh: e.target.value })} /></label>
          <label>WhatsApp<input value={contact.whatsapp} onChange={e => setContact({ ...contact, whatsapp: e.target.value })} /></label>
          <label>Email<input value={contact.email} onChange={e => setContact({ ...contact, email: e.target.value })} /></label>
          <label>Address (Canada)<input value={contact.address_ca} onChange={e => setContact({ ...contact, address_ca: e.target.value })} /></label>
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