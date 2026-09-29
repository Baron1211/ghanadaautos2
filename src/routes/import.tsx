import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export const Route = createFileRoute("/import")({
  head: () => ({
    meta: [
      { title: "Import From China — RRR Auto Export" },
      { name: "description", content: "We source, inspect, purchase, ship and deliver vehicles from China to Ghana. Start-to-finish import service." },
      { property: "og:title", content: "Import From China — RRR Auto Export" },
      { property: "og:description", content: "We source, inspect, purchase, ship and deliver vehicles from China to Ghana. Start-to-finish import service." },
    ],
  }),
  component: ImportPage,
});

const steps = [
  { n: 1, title: "Choose Vehicle", desc: "Tell us your make, model, year and budget — or send a link." },
  { n: 2, title: "Inspection", desc: "We inspect and share a full condition report before you commit." },
  { n: 3, title: "Purchase", desc: "We buy on your behalf in China with secure documentation." },
  { n: 4, title: "Shipping", desc: "Loaded and shipped via trusted RoRo or container carriers." },
  { n: 5, title: "Arrival", desc: "Docks in Tema — we track and update you at every step." },
  { n: 6, title: "Customs & Clearing", desc: "We handle all duties, documentation and port formalities." },
  { n: 7, title: "Delivery", desc: "Cleaned, fueled and delivered to your doorstep in Ghana." },
];

function ImportPage() {
  const [form, setForm] = useState({ name: "", phone: "", email: "", make: "", model: "", year: "", budget: "", notes: "" });
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone) { toast.error("Please provide your name and phone"); return; }
    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      toast.success("Import request received. Our sourcing team will contact you within 24 hours.");
      setForm({ name: "", phone: "", email: "", make: "", model: "", year: "", budget: "", notes: "" });
    }, 600);
  };

  return (
    <div className="ga">
      <SiteHeader />
      <section className="section" style={{ background: "#fff" }}>
        <div className="container">
          <div className="section-head">
            <div className="eyebrow">🇨🇳 Import From China</div>
            <h1>Import your dream vehicle from China</h1>
            <p>We source, inspect, purchase, ship and deliver vehicles directly from China to Ghana — start to finish.</p>
          </div>

          <div className="services-grid">
            {steps.map((s) => (
              <div key={s.n} className="service-card">
                <div className="service-icon" style={{ fontWeight: 800, fontSize: 22 }}>{s.n}</div>
                <h4>{s.title}</h4>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ background: "var(--muted-bg, #f6f7f5)" }}>
        <div className="container">
          <div className="booking">
            <div className="booking-info">
              <h3>Request a Vehicle Import</h3>
              <p>Send us the details — we'll come back with sourcing options, timelines and a landed cost in Ghana.</p>
              <div className="mini-stat">
                <div className="service-icon">🚢</div>
                <div><strong>Guangzhou → Tema</strong><br /><span style={{ fontSize: 13, color: "var(--muted)" }}>Trusted RoRo & container carriers</span></div>
              </div>
              <div className="mini-stat">
                <div className="service-icon">📋</div>
                <div><strong>Full Documentation</strong><br /><span style={{ fontSize: 13, color: "var(--muted)" }}>Customs, duties & clearing handled</span></div>
              </div>
              <div className="mini-stat">
                <div className="service-icon">💬</div>
                <div><strong>Direct WhatsApp</strong><br /><span style={{ fontSize: 13, color: "var(--muted)" }}><a href="https://wa.me/233592495787" target="_blank" rel="noopener noreferrer">+233 592 495 787</a></span></div>
              </div>
            </div>
            <form className="form-grid" onSubmit={submit}>
              <div><label>Your Name</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
              <div><label>Phone</label><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required /></div>
              <div className="full"><label>Email</label><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              <div><label>Make</label><input value={form.make} onChange={(e) => setForm({ ...form, make: e.target.value })} placeholder="e.g. Toyota" /></div>
              <div><label>Model</label><input value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} placeholder="e.g. Highlander" /></div>
              <div><label>Year</label><input value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} placeholder="e.g. 2022" /></div>
              <div><label>Budget (GHS)</label><input value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} placeholder="e.g. 400,000" /></div>
              <div className="full"><label>Notes</label><textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Trim, color, options, link to listing…" /></div>
              <div className="full"><button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={busy}>{busy ? "Submitting…" : "Request Vehicle →"}</button></div>
            </form>
          </div>
        </div>
      </section>
    <SiteFooter />
    </div>
  );
}
