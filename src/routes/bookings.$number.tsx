import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/bookings/$number")({
  head: () => ({ meta: [{ title: "Rental booking — Ghanada Autos" }, { name: "robots", content: "noindex" }] }),
  component: BookingView,
});

function BookingView() {
  const { number } = Route.useParams();
  const { data, isLoading } = useQuery({
    queryKey: ["booking", number],
    queryFn: async () => {
      const { data } = await supabase.from("rental_bookings").select("*, rental:rentals(name, image_url)").eq("booking_number", number).maybeSingle();
      return data;
    },
  });

  if (isLoading) return <div className="ga-app-main"><p className="ga-muted">Loading…</p></div>;
  if (!data) return (
    <div className="ga-app-main">
      <h1>Booking not found</h1>
      <Link to="/" className="ga-btn-primary">Home</Link>
    </div>
  );

  return (
    <div className="ga-detail">
      <div className="ga-detail-nav"><Link to="/">← Home</Link></div>
      <div className="ga-confirm">
        <div className="ga-confirm-check">🚗</div>
        <h1>Booking received!</h1>
        <p>Reference <strong>{data.booking_number}</strong></p>
        <span className={`ga-badge ga-badge-${data.status}`}>{data.status}</span>
      </div>
      <div className="ga-order-card">
        <h3>{data.rental?.name}</h3>
        <p><strong>Pickup:</strong> {data.pickup_date} → <strong>Return:</strong> {data.return_date} ({data.days} days)</p>
        <p><strong>Destination:</strong> {data.destination || "—"}</p>
        <p><strong>Driver:</strong> {data.with_driver ? `Yes (+ GHS ${Number(data.driver_daily_fee).toFixed(2)}/day)` : "Self-drive"}</p>
        <table className="ga-receipt">
          <tbody>
            <tr><td>Rental ({data.days} × GHS {Number(data.daily_rate).toFixed(2)})</td><td>GHS {Number(data.subtotal).toFixed(2)}</td></tr>
            {data.with_driver && <tr><td>Driver ({data.days} × GHS {Number(data.driver_daily_fee).toFixed(2)})</td><td>GHS {(Number(data.driver_daily_fee) * data.days).toFixed(2)}</td></tr>}
            <tr><td><strong>Total</strong></td><td><strong>{data.currency} {Number(data.total).toFixed(2)}</strong></td></tr>
          </tbody>
        </table>
        <p className="ga-muted">We'll confirm your booking via {data.guest_email} / {data.guest_phone}.</p>
      </div>
    </div>
  );
}