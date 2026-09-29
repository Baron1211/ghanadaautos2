import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { useContent } from "@/lib/cms";

export const Route = createFileRoute("/repairs")({
  head: () => ({
    meta: [
      { title: "Auto Repairs & Diagnostics — RRR Auto Export" },
      { name: "description", content: "Certified auto repair technicians in Ghana. Request a repair for any make, model or vehicle part and get a quote." },
      { property: "og:title", content: "Auto Repairs & Diagnostics — RRR Auto Export" },
      { property: "og:description", content: "Request a repair for any make, model or vehicle part and get a quote from certified technicians." },
    ],
  }),
  component: RepairsPage,
});

const services = [
  { title: "Oil Change", desc: "Synthetic & conventional options with filter replacement.", from: "GHS 180" },
  { title: "Engine Repair", desc: "Full diagnostics, timing belts, gaskets, overhauls.", from: "GHS 850" },
  { title: "Brake Repair", desc: "Pads, rotors, calipers and full brake fluid service.", from: "GHS 450" },
  { title: "AC Repair", desc: "Regas, compressor service, leak detection.", from: "GHS 380" },
  { title: "Battery Replacement", desc: "Free testing, installation, and old battery disposal.", from: "GHS 520" },
  { title: "Tyre & Wheel", desc: "Alignment, balancing, rotation, and puncture repair.", from: "GHS 220" },
  { title: "Electrical & Diagnostics", desc: "Scanner-based diagnostics and wiring repair.", from: "GHS 300" },
  { title: "Detailing & Valet", desc: "Interior/exterior deep cleaning and polish.", from: "GHS 250" },
];

const VEHICLE_TYPES = ["Sedan", "SUV", "Pickup", "Van", "Bus", "Truck", "Motorcycle"];
const YEARS = Array.from({ length: 36 }, (_, i) => String(new Date().getFullYear() + 1 - i));

const empty = {
  customer_name: "", customer_phone: "", customer_email: "",
  vehicle_type: "Sedan", make: "", model: "", year: "",
  part: "", service: "Engine Repair",
  preferred_date: "", preferred_time: "", location: "", notes: "",
};

function RepairsPage() {
  const t = useContent("repairs_page");
  const [form, setForm] = useState({ ...empty });
  const [busy, setBusy] = useState(false);
  const [ref, setRef] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customer_name || !form.customer_phone || !form.part) {
      toast.error("Please provide your name, phone and the part you want repaired");
      return;
    }
    setBusy(true);
    const { data, error } = await (supabase as any).rpc("create_repair_request", { _req: form });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    setRef(String(data));
    setForm({ ...empty });
    toast.success("Repair request submitted");
  };

  return (
    <div className="ga">
      <SiteHeader />
      <section className="section" style={{ background: "#fff" }}>
        <div className="container">
          <div className="section-head">
            <div className="eyebrow">{t("eyebrow")}</div>
            <h1>{t("title")}</h1>
            <p>{t("subtitle")}</p>
          </div>
          <div className="repair-grid">
            {services.map((s) => (
              <div key={s.title} className="repair-card">
                <h4>{s.title}</h4>
                <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 6 }}>{s.desc}</p>
                <div style={{ marginTop: 10, fontWeight: 600, color: "var(--primary, #065F46)" }}>From {s.from}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="booking">
            <div className="booking-info">
              <h3>{t("form_title")}</h3>
              <p>{t("form_intro")}</p>
              <div className="mini-stat">
                <div><strong>Certified Mechanics</strong><br /><span style={{ fontSize: 13, color: "var(--muted)" }}>Factory-trained across all major brands</span></div>
              </div>
              <div className="mini-stat">
                <div><strong>Fast Turnaround</strong><br /><span style={{ fontSize: 13, color: "var(--muted)" }}>Most jobs done within 24 hours</span></div>
              </div>
              <div className="mini-stat">
                <div><strong>WhatsApp Support</strong><br /><span style={{ fontSize: 13, color: "var(--muted)" }}>+233 592 495 787</span></div>
              </div>
            </div>

            {ref ? (
              <div className="ga-repair-success">
                <h3>Request received</h3>
                <p>Your reference number is</p>
                <strong>{ref}</strong>
                <p className="ga-muted">Our service team will review your request and contact you with a quote. Keep this reference for follow-up.</p>
                <button className="btn btn-primary" type="button" onClick={() => setRef(null)}>Submit another request</button>
              </div>
            ) : (
              <form className="form-grid" onSubmit={submit}>
                <div><label>Your Name *</label><input value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} required /></div>
                <div><label>Phone *</label><input value={form.customer_phone} onChange={(e) => setForm({ ...form, customer_phone: e.target.value })} required /></div>
                <div className="full"><label>Email</label><input type="email" value={form.customer_email} onChange={(e) => setForm({ ...form, customer_email: e.target.value })} /></div>

                <div>
                  <label>Vehicle Type</label>
                  <select value={form.vehicle_type} onChange={(e) => setForm({ ...form, vehicle_type: e.target.value })}>
                    {VEHICLE_TYPES.map((v) => <option key={v}>{v}</option>)}
                  </select>
                </div>
                <div><label>Make</label><input placeholder="e.g. Toyota" value={form.make} onChange={(e) => setForm({ ...form, make: e.target.value })} /></div>
                <div><label>Model</label><input placeholder="e.g. Corolla" value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} /></div>
                <div>
                  <label>Year</label>
                  <select value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })}>
                    <option value="">Select year</option>
                    {YEARS.map((y) => <option key={y}>{y}</option>)}
                  </select>
                </div>

                <div className="full"><label>Body part / component to repair *</label><input placeholder="e.g. front bumper, gearbox, alternator" value={form.part} onChange={(e) => setForm({ ...form, part: e.target.value })} required /></div>
                <div>
                  <label>Service Category</label>
                  <select value={form.service} onChange={(e) => setForm({ ...form, service: e.target.value })}>
                    {services.map((s) => <option key={s.title}>{s.title}</option>)}
                  </select>
                </div>
                <div><label>Preferred Date</label><input type="date" value={form.preferred_date} onChange={(e) => setForm({ ...form, preferred_date: e.target.value })} /></div>
                <div><label>Preferred Time</label><input type="time" value={form.preferred_time} onChange={(e) => setForm({ ...form, preferred_time: e.target.value })} /></div>
                <div><label>Location</label><input type="text" placeholder="e.g. East Legon, Accra" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
                <div className="full"><label>Describe the issue</label><textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
                <div className="full"><button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={busy}>{busy ? "Submitting…" : "Submit Repair Request"}</button></div>
              </form>
            )}
          </div>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
