import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { useContent } from "@/lib/cms";
import { PackageSearch, MapPin, Clock, Truck, ShieldCheck, Check } from "lucide-react";

export const Route = createFileRoute("/track")({
  validateSearch: (search: Record<string, unknown>) => ({ number: (search.number as string) || "" }),
  head: () => ({
    meta: [
      { title: "Track Your Order — Ghanada Autos" },
      { name: "description", content: "Track your Ghanada Autos vehicle, parts or shipment with your tracking number." },
      { property: "og:title", content: "Track Your Order — Ghanada Autos" },
      { property: "og:description", content: "Enter your tracking number to see live shipment status, location and updates." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TrackPage,
});

type Result = {
  tracking_number: string; description: string | null; carrier: string | null;
  status: string; current_location: string | null; eta: string | null; created_at: string;
  events: { status: string; location: string | null; message: string | null; happened_at: string }[];
};

function TrackPage() {
  const t = useContent("tracking_page");
  const navigate = useNavigate();
  const { number } = Route.useSearch();
  const [value, setValue] = useState(number);
  const [result, setResult] = useState<Result | null>(null);
  const [busy, setBusy] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const lookup = async (num: string) => {
    if (!num.trim()) return;
    setBusy(true); setNotFound(false); setResult(null);
    const { data, error } = await (supabase as any).rpc("track_shipment", { _tracking_number: num.trim() });
    setBusy(false);
    if (error || !data) { setNotFound(true); return; }
    setResult(data as Result);
  };

  useEffect(() => {
    if (number) { setValue(number); lookup(number); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [number]);

  const steps = ["pending", "in_transit", "arrived", "delivered"];
  const stepLabels: Record<string, string> = {
    pending: "Order received",
    in_transit: "In transit",
    arrived: "Arrived in Ghana",
    delivered: "Delivered",
  };
  const activeStep = result ? Math.max(0, steps.indexOf(result.status)) : -1;

  return (
    <div className="ga">
      <SiteHeader />

      <section className="ga-trk-hero">
        <div className="container">
          <div className="ga-trk-hero-inner">
            <div className="eyebrow">Order Tracking</div>
            <h1>{t("title")}</h1>
            <p>{t("subtitle")}</p>

            <form
              className="ga-trk-form"
              onSubmit={(e) => { e.preventDefault(); navigate({ to: "/track", search: { number: value.trim() } }); lookup(value); }}
            >
              <span className="ga-trk-form-icon"><PackageSearch size={18} /></span>
              <input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Enter tracking number e.g. GA-8F3K21AB"
                aria-label="Tracking number"
              />
              <button className="btn btn-primary" type="submit" disabled={busy}>
                {busy ? "Searching…" : "Track"}
              </button>
            </form>
            <div className="ga-trk-hint">
              <ShieldCheck size={14} /> Your tracking number was sent to you by email or WhatsApp.
            </div>
          </div>
        </div>
      </section>

      <section className="section ga-trk-body">
        <div className="container">
          {busy && <div className="ga-trk-skeleton" aria-hidden="true" />}

          {notFound && (
            <div className="ga-trk-empty">
              <span className="ga-trk-empty-icon"><PackageSearch size={24} /></span>
              <strong>No shipment found</strong>
              <span className="ga-muted">
                Double-check the tracking number and try again. Still stuck? Our team can help right away.
              </span>
              <a className="btn btn-outline" href="https://wa.me/14374364357" target="_blank" rel="noopener noreferrer">
                Chat with support
              </a>
            </div>
          )}

          {result && (
            <div className="ga-trk-result">
              <div className="ga-trk-card ga-trk-summary">
                <div className="ga-trk-summary-top">
                  <div>
                    <span className="ga-trk-label">Tracking number</span>
                    <h2>{result.tracking_number}</h2>
                    {result.description ? <p className="ga-muted">{result.description}</p> : null}
                  </div>
                  <span className={`ga-status ga-status-${result.status}`}>{result.status.replace(/_/g, " ")}</span>
                </div>

                <div className="ga-trk-steps" role="list">
                  {steps.map((s, i) => (
                    <div key={s} role="listitem" className={`ga-trk-step${i <= activeStep ? " is-done" : ""}${i === activeStep ? " is-current" : ""}`}>
                      <span className="ga-trk-step-dot">{i <= activeStep ? <Check size={12} /> : null}</span>
                      <span className="ga-trk-step-label">{stepLabels[s]}</span>
                    </div>
                  ))}
                </div>

                <div className="ga-trk-facts">
                  <div>
                    <span className="ga-trk-label"><MapPin size={13} /> Current location</span>
                    <strong>{result.current_location || "Awaiting update"}</strong>
                  </div>
                  <div>
                    <span className="ga-trk-label"><Clock size={13} /> Estimated arrival</span>
                    <strong>{result.eta ? new Date(result.eta).toLocaleDateString() : "To be confirmed"}</strong>
                  </div>
                  <div>
                    <span className="ga-trk-label"><Truck size={13} /> Carrier</span>
                    <strong>{result.carrier || "Ghanada Autos Logistics"}</strong>
                  </div>
                </div>
              </div>

              <div className="ga-trk-card ga-trk-history">
                <h3>Shipment history</h3>
                {result.events.length === 0 ? (
                  <p className="ga-muted">No updates recorded yet. We’ll notify you as soon as your shipment moves.</p>
                ) : (
                  <ol className="ga-track-timeline">
                    {result.events.map((e, i) => (
                      <li key={i} className={i === 0 ? "is-current" : ""}>
                        <div className="ga-track-bullet" />
                        <div>
                          <strong>{e.status.replace(/_/g, " ")}</strong>
                          {e.location ? <span className="ga-muted"> · {e.location}</span> : null}
                          {e.message ? <p>{e.message}</p> : null}
                          <small>{new Date(e.happened_at).toLocaleString()}</small>
                        </div>
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            </div>
          )}

          {!result && !notFound && !busy && (
            <div className="ga-trk-help">
              <div className="ga-trk-help-card">
                <span className="ga-trk-help-icon"><PackageSearch size={18} /></span>
                <h3>Where is my number?</h3>
                <p>We send your tracking number by email and WhatsApp once your order leaves our Toronto warehouse.</p>
              </div>
              <div className="ga-trk-help-card">
                <span className="ga-trk-help-icon"><Truck size={18} /></span>
                <h3>Shipping timelines</h3>
                <p>Ocean freight from Canada to Takoradi typically takes 4–6 weeks, plus clearing at the port.</p>
              </div>
              <div className="ga-trk-help-card">
                <span className="ga-trk-help-icon"><ShieldCheck size={18} /></span>
                <h3>Need a hand?</h3>
                <p>Message us on WhatsApp at +1 437 436 4357 and we’ll check your shipment for you.</p>
              </div>
            </div>
          )}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

