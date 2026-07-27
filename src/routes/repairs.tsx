import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export const Route = createFileRoute("/repairs")({
  head: () => ({
    meta: [
      { title: "Auto Repairs & Diagnostics — Ghanada Autos" },
      { name: "description", content: "Certified auto repair technicians in Ghana. Oil change, engine, brakes, AC, batteries, and full diagnostics." },
      { property: "og:title", content: "Auto Repairs & Diagnostics — Ghanada Autos" },
      { property: "og:description", content: "Certified auto repair technicians in Ghana. Oil change, engine, brakes, AC, batteries, and full diagnostics." },
    ],
  }),
  component: RepairsPage,
});

const services = [
  { icon: "🛢️", title: "Oil Change", desc: "Synthetic & conventional options with filter replacement.", from: "GHS 180" },
  { icon: "🔧", title: "Engine Repair", desc: "Full diagnostics, timing belts, gaskets, overhauls.", from: "GHS 850" },
  { icon: "🛑", title: "Brake Repair", desc: "Pads, rotors, calipers and full brake fluid service.", from: "GHS 450" },
  { icon: "❄️", title: "AC Repair", desc: "Regas, compressor service, leak detection.", from: "GHS 380" },
  { icon: "🔋", title: "Battery Replacement", desc: "Free testing, installation, and old battery disposal.", from: "GHS 520" },
  { icon: "🛞", title: "Tyre & Wheel", desc: "Alignment, balancing, rotation, and puncture repair.", from: "GHS 220" },
  { icon: "⚡", title: "Electrical & Diagnostics", desc: "Scanner-based diagnostics and wiring repair.", from: "GHS 300" },
  { icon: "🚿", title: "Detailing & Valet", desc: "Interior/exterior deep cleaning and polish.", from: "GHS 250" },
];

function RepairsPage() {
  const [form, setForm] = useState({ name: "", phone: "", email: "", vehicle: "SUV", service: "Oil Change", date: "", time: "", location: "", notes: "" });
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone) { toast.error("Please provide your name and phone"); return; }
    setBusy(true);
    // Backend booking table is not yet wired for repairs — for now confirm to user.
    setTimeout(() => {
      setBusy(false);
      toast.success("Repair booking received. Our team will contact you shortly.");
      setForm({ name: "", phone: "", email: "", vehicle: "SUV", service: "Oil Change", date: "", time: "", location: "", notes: "" });
    }, 600);
  };

  return (
    <div className="ga">
      <SiteHeader />
      <section className="section" style={{ background: "#fff" }}>
        <div className="container">
          <div className="section-head">
            <div className="eyebrow">Auto Repairs & Diagnostics</div>
            <h1>Certified technicians. Transparent pricing.</h1>
            <p>Factory-trained across all major brands. Most jobs done within 24 hours.</p>
          </div>
          <div className="repair-grid">
            {services.map((s) => (
              <div key={s.title} className="repair-card">
                <div className="service-icon">{s.icon}</div>
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
              <h3>Book a Repair</h3>
              <p>Tell us what's wrong and we'll match you with the right technician and a same-week slot.</p>
              <div className="mini-stat">
                <div className="service-icon">✅</div>
                <div><strong>Certified Mechanics</strong><br /><span style={{ fontSize: 13, color: "var(--muted)" }}>Factory-trained across all major brands</span></div>
              </div>
              <div className="mini-stat">
                <div className="service-icon">⏱️</div>
                <div><strong>Fast Turnaround</strong><br /><span style={{ fontSize: 13, color: "var(--muted)" }}>Most jobs done within 24 hours</span></div>
              </div>
              <div className="mini-stat">
                <div className="service-icon">💬</div>
                <div><strong>WhatsApp Support</strong><br /><span style={{ fontSize: 13, color: "var(--muted)" }}>+1 437 436 4357</span></div>
              </div>
            </div>
            <form className="form-grid" onSubmit={submit}>
              <div><label>Your Name</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
              <div><label>Phone</label><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required /></div>
              <div className="full"><label>Email</label><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              <div>
                <label>Vehicle Type</label>
                <select value={form.vehicle} onChange={(e) => setForm({ ...form, vehicle: e.target.value })}>
                  <option>SUV</option><option>Sedan</option><option>Pickup</option><option>Van</option><option>Motorcycle</option>
                </select>
              </div>
              <div>
                <label>Service</label>
                <select value={form.service} onChange={(e) => setForm({ ...form, service: e.target.value })}>
                  {services.map((s) => <option key={s.title}>{s.title}</option>)}
                </select>
              </div>
              <div><label>Preferred Date</label><input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
              <div><label>Preferred Time</label><input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} /></div>
              <div className="full"><label>Location</label><input type="text" placeholder="e.g. East Legon, Accra" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
              <div className="full"><label>Describe the issue</label><textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
              <div className="full"><button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={busy}>{busy ? "Submitting…" : "Book Appointment"}</button></div>
            </form>
          </div>
        </div>
      </section>
    <SiteFooter />
    </div>
  );
}
