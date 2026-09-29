import { createFileRoute, Link } from "@tanstack/react-router";
import EmojiIcon from "@/components/EmojiIcon";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/orders/$number")({
  head: () => ({
    meta: [
      { title: "Order confirmation — RRR Auto Export" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OrderView,
});

function OrderView() {
  const { number } = Route.useParams();
  const { data, isLoading } = useQuery({
    queryKey: ["order", number],
    queryFn: async () => {
      const { data } = await supabase.from("orders").select("*, order_items(*)").eq("order_number", number).maybeSingle();
      return data;
    },
  });

  if (isLoading) return <div className="ga-app-main"><p className="ga-muted">Loading…</p></div>;
  if (!data) return (
    <div className="ga-app-main">
      <h1>Order not found</h1>
      <p className="ga-muted">If you just placed a guest order, please sign in with the same email to view it, or contact us with the order number.</p>
      <Link to="/" className="ga-btn-primary">Home</Link>
    </div>
  );

  return (
    <div className="ga-detail">
      <div className="ga-detail-nav"><Link to="/">← Home</Link></div>
      <div className="ga-confirm">
        <div className="ga-confirm-check"><EmojiIcon e="✅" /></div>
        <h1>Thank you!</h1>
        <p>Your order <strong>{data.order_number}</strong> was received.</p>
        <span className={`ga-badge ga-badge-${data.status}`}>{data.status}</span>
      </div>
      <div className="ga-order-card">
        <table className="ga-receipt">
          <thead><tr><th>Item</th><th>Qty</th><th>Unit</th><th>Total</th></tr></thead>
          <tbody>
            {data.order_items.map((it: any) => (
              <tr key={it.id}>
                <td>{it.name}{it.rental_days ? ` (${it.rental_days} days)` : ""}</td>
                <td>{it.quantity}</td>
                <td>{Number(it.unit_price).toFixed(2)}</td>
                <td>{Number(it.line_total).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            {Number((data as any).delivery_fee) > 0 && (<>
              <tr><td colSpan={3}>Subtotal</td><td>{data.currency} {Number(data.subtotal).toFixed(2)}</td></tr>
              <tr><td colSpan={3}>Delivery{(data as any).delivery_distance_km ? ` (${Number((data as any).delivery_distance_km)} km)` : ""}</td><td>{data.currency} {Number((data as any).delivery_fee).toFixed(2)}</td></tr>
            </>)}
            <tr><td colSpan={3}><strong>Total</strong></td><td><strong>{data.currency} {Number(data.total).toFixed(2)}</strong></td></tr>
          </tfoot>
        </table>
        <p className="ga-muted">Payment: {data.payment_method || "arranged with team"} · Status: {data.payment_status}</p>
        {data.shipping_address && <p className="ga-muted">Ship to: {data.shipping_address}</p>}
        <p className="ga-muted">Our team will contact you shortly on {data.phone || data.guest_email}.</p>
      </div>
    </div>
  );
}