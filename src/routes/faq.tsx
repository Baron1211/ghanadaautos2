import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "Frequently Asked Questions — RRR Auto Export" },
      { name: "description", content: "Answers about buying cars, renting vehicles, spare parts, importing from China, financing, payments and delivery at RRR Auto Export." },
      { property: "og:title", content: "Frequently Asked Questions — RRR Auto Export" },
      { property: "og:description", content: "Answers about buying, renting, parts, imports, financing and delivery at RRR Auto Export." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: FaqPage,
});

const faqs: { group: string; items: { q: string; a: string }[] }[] = [
  {
    group: "Buying a vehicle",
    items: [
      { q: "Are the listed prices final?", a: "Listed prices are in Ghana Cedis (GHS) and exclude registration and insurance unless stated. Our sales team confirms the final invoice before payment." },
      { q: "Can I inspect a car before paying?", a: "Yes. Reserve the vehicle online and book an inspection at our Takoradi yard, or request a full inspection report and video walkaround if you are out of town." },
      { q: "Do you offer financing?", a: "Yes. Use the finance calculator on any vehicle page to estimate your monthly payment, then submit an inquiry and our finance desk will guide you through approval." },
    ],
  },
  {
    group: "Car rentals",
    items: [
      { q: "What is the difference between self-drive and driver on request?", a: "Self-drive means you drive the vehicle yourself with a valid licence. Driver on request adds a professional driver for an extra daily fee shown at booking." },
      { q: "What do I need to rent a vehicle?", a: "A valid driver's licence, a government-issued ID, and a refundable security deposit. Corporate bookings can be invoiced." },
      { q: "Can I extend my rental?", a: "Yes, contact us at least 24 hours before your return date and we will extend the booking if the vehicle is available." },
    ],
  },
  {
    group: "Spare parts",
    items: [
      { q: "Are your parts genuine?", a: "We stock OEM and quality aftermarket parts. Each listing states the type, and variations such as size or fitment are selectable on the product page." },
      { q: "What if the part does not fit?", a: "Contact support within 7 days with your order number and the unused part in its original packaging for an exchange." },
    ],
  },
  {
    group: "Import from China & clearing",
    items: [
      { q: "How long does an import take?", a: "Typically 6–10 weeks from purchase to Tema/Takoradi port clearance, depending on shipping schedules." },
      { q: "What does the import quote cover?", a: "Vehicle cost, inland transport in China, ocean freight, duties and clearing. We send a full breakdown before you commit." },
      { q: "Can you clear a vehicle I bought myself?", a: "Yes. Our clearing and forwarding team handles documentation, duties and delivery for vehicles you sourced yourself." },
    ],
  },
  {
    group: "Payments & orders",
    items: [
      { q: "Which payment methods do you accept?", a: "Bank transfer, MTN MoMo, Vodafone Cash and card. Payment instructions and your invoice are sent by email after checkout." },
      { q: "Can I check out as a guest?", a: "Yes. Guest checkout is available and your invoice and payment confirmation are sent by email. Creating an account lets you track orders, rentals and receipts in your dashboard." },
    ],
  },
];

function FaqPage() {
  const [open, setOpen] = useState<string | null>("Are the listed prices final?");
  return (
    <div className="ga">
      <SiteHeader />
      <section className="section" style={{ background: "#fff" }}>
        <div className="container">
          <div className="section-head" style={{ maxWidth: 720 }}>
            <div className="eyebrow">Help Centre</div>
            <h1>Frequently asked questions</h1>
            <p>Everything about buying, renting, parts, imports, financing and payments. Still stuck? <Link to="/support" style={{ color: "#0F8A5F", fontWeight: 700 }}>Contact support</Link>.</p>
          </div>

          <div style={{ display: "grid", gap: 34, maxWidth: 880 }}>
            {faqs.map((section) => (
              <div key={section.group}>
                <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 14 }}>{section.group}</h3>
                <div style={{ display: "grid", gap: 12 }}>
                  {section.items.map((item) => {
                    const isOpen = open === item.q;
                    return (
                      <div key={item.q} style={{ border: "1px solid #e6ebe8", borderRadius: 14, background: "#fbfdfc", overflow: "hidden" }}>
                        <button
                          type="button"
                          onClick={() => setOpen(isOpen ? null : item.q)}
                          style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "16px 18px", background: "transparent", border: 0, cursor: "pointer", textAlign: "left", font: "inherit", fontWeight: 700 }}
                          aria-expanded={isOpen}
                        >
                          <span>{item.q}</span>
                          <span style={{ color: "#0F8A5F", fontSize: 20, lineHeight: 1 }}>{isOpen ? "−" : "+"}</span>
                        </button>
                        {isOpen && <div style={{ padding: "0 18px 18px", color: "#4b5a54", lineHeight: 1.65 }}>{item.a}</div>}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
