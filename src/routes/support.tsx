import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export const Route = createFileRoute("/support")({
  head: () => ({
    meta: [
      { title: "Contact Support & Track Shipment — RRR Auto Export" },
      { name: "description", content: "Reach the RRR Auto Export support team in Guangzhou and Takoradi, track an import shipment, or send a message about an order, rental or repair." },
      { property: "og:title", content: "Contact Support & Track Shipment — RRR Auto Export" },
      { property: "og:description", content: "Talk to RRR Auto Export support or track your import shipment status." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SupportPage,
});

function SupportPage() {
  const navigate = useNavigate();
  const [track, setTrack] = useState("");
  const [form, setForm] = useState({ name: "", email: "", phone: "", topic: "Order / Invoice", message: "" });
  const [busy, setBusy] = useState(false);

  const submitTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!track.trim()) { toast.error("Enter your order or shipment reference"); return; }
    navigate({ to: "/track", search: { number: track.trim() } });
  };

  const submitMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) { toast.error("Please fill in your name, email and message"); return; }
    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      toast.success("Message sent. Our support team replies within one business day.");
      setForm({ name: "", email: "", phone: "", topic: "Order / Invoice", message: "" });
    }, 600);
  };

  const card: React.CSSProperties = { border: "1px solid #e6ebe8", borderRadius: 18, background: "#fff", padding: 24 };
  const input: React.CSSProperties = { width: "100%", padding: "12px 14px", border: "1px solid #dde5e1", borderRadius: 10, font: "inherit", background: "#fbfdfc" };

  return (
    <div className="ga">
      <SiteHeader />
      <section className="section" style={{ background: "#fff" }}>
        <div className="container">
          <div className="section-head" style={{ maxWidth: 720 }}>
            <div className="eyebrow">Support</div>
            <h1>We're here to help</h1>
            <p>Track an import shipment, ask about an order, or talk to a human. See also our <Link to="/faq" style={{ color: "#0F8A5F", fontWeight: 700 }}>FAQs</Link>.</p>
          </div>

          <div style={{ display: "grid", gap: 20, gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", marginBottom: 40 }}>
            {[
              { t: "Call us", l1: "+233 592 495 787", l2: "+233 592 495 787" },
              { t: "WhatsApp", l1: "+233 592 495 787", l2: "Chat 8am – 8pm GMT" },
              { t: "Locations", l1: "Guangzhou, China", l2: "Takoradi, Ghana" },
            ].map((c) => (
              <div key={c.t} style={card}>
                <h4 style={{ fontWeight: 800, marginBottom: 8 }}>{c.t}</h4>
                <div style={{ color: "#4b5a54" }}>{c.l1}</div>
                <div style={{ color: "#4b5a54" }}>{c.l2}</div>
              </div>
            ))}
          </div>

          <div id="track" style={{ ...card, marginBottom: 40, scrollMarginTop: 120 }}>
            <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 6 }}>Track a shipment or order</h3>
            <p style={{ color: "#4b5a54", marginBottom: 16 }}>Enter the tracking number from your invoice or update message to see the latest shipment status.</p>
            <form onSubmit={submitTrack} style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <input style={{ ...input, flex: "1 1 240px" }} placeholder="e.g. GA-10234 or BL reference" value={track} onChange={(e) => setTrack(e.target.value)} />
              <button className="btn btn-primary" type="submit">Track</button>
            </form>
          </div>

          <div style={{ ...card, maxWidth: 720 }}>
            <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 16 }}>Send us a message</h3>
            <form onSubmit={submitMessage} style={{ display: "grid", gap: 14 }}>
              <div style={{ display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
                <input style={input} placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                <input style={input} type="email" placeholder="Email address" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                <input style={input} placeholder="Phone (optional)" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                <select style={input} value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })}>
                  <option>Order / Invoice</option>
                  <option>Car rental booking</option>
                  <option>Spare parts</option>
                  <option>Import from China</option>
                  <option>Clearing & forwarding</option>
                  <option>Financing</option>
                  <option>Other</option>
                </select>
              </div>
              <textarea style={{ ...input, minHeight: 130, resize: "vertical" }} placeholder="How can we help?" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
              <div>
                <button className="btn btn-primary" type="submit" disabled={busy}>{busy ? "Sending…" : "Send message"}</button>
              </div>
            </form>
          </div>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
