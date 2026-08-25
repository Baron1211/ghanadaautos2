import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { useContent } from "@/lib/cms";
import { PackageSearch, MapPin, Clock } from "lucide-react";

export const Route = createFileRoute("/track")({
  validateSearch: (search: Record<string, unknown>) => ({ number: (search.number as string) || "" }),
  head: () => ({
    meta: [
      { title: "Track Your Order — Ghanada Autos" },
      { name: "description", content: "Track your Ghanada Autos vehicle, parts or shipment with your tracking number." },
      { property: "og:title", content: "Track Your Order — Ghanada Autos" },
      { property: "og:description", content: "Enter your tracking number to see live shipment status, location and updates." },
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

  return (
    <div className="ga">
      <SiteHeader />
      <section className="section" style={{ background: "#fff" }}>
        <div className="container">
          <div className="section-head">
            <div className="eyebrow">Order Tracking</div>
            <h1>{t("title")}</h1>
            <p>{t("subtitle")}</p>
          </div>

          <form
            className="ga-track-form"
            onSubmit={(e) => { e.preventDefault(); navigate({ to: "/track", search: { number: value.trim() } }); lookup(value); }}
          >
            <input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="e.g. GA-8F3K21AB"
              aria-label="Tracking number"
            />
            <button className="btn btn-primary" type="submit" disabled={busy}>
              {busy ? "Searching…" : "Track"}
            </button>
          </form>

          {notFound && (
            <div className="ga-track-empty">
              <PackageSearch size={26} />
              <strong>No shipment found</strong>
              <span>Check the tracking number and try again, or contact support on WhatsApp.</span>
            </div>
          )}

          {result && (
            <div className="ga-track-result">
              <div className="ga-track-head">
                <div>
                  <span className="ga-muted ga-small">Tracking number</span>
                  <h3>{result.tracking_number}</h3>
                  {result.description ? <p className="ga-muted">{result.description}</p> : null}
                </div>
                <span className={`ga-status ga-status-${result.status}`}>{result.status.replace(/_/g, " ")}</span>
              </div>
              <div className="ga-track-meta">
                <div><MapPin size={15} /> <span>{result.current_location || "Awaiting update"}</span></div>
                <div><Clock size={15} /> <span>{result.eta ? `ETA ${new Date(result.eta).toLocaleDateString()}` : "ETA to be confirmed"}</span></div>
                {result.carrier ? <div><PackageSearch size={15} /> <span>{result.carrier}</span></div> : null}
              </div>

              <h4 className="ga-track-timeline-title">Progress</h4>
              {result.events.length === 0 ? (
                <p className="ga-muted">No updates recorded yet.</p>
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
          )}
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
