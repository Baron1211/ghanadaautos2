import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/orders")({
  component: AdminOrders,
});

const STATUSES = ["pending", "processing", "completed", "cancelled"];

function AdminOrders() {
  const qc = useQueryClient();
  const { data: orders } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*), profile:profiles(full_name, phone)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const setStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Order updated");
    qc.invalidateQueries({ queryKey: ["admin-orders"] });
  };

  return (
    <>
      <h1>Orders</h1>
      <div className="ga-order-list">
        {orders?.map((o: any) => (
          <div key={o.id} className="ga-order-card">
            <div className="ga-order-head">
              <div>
                <strong>{o.order_number}</strong>
                <span className="ga-muted">{o.profile?.full_name || "Customer"} · {o.phone}</span>
              </div>
              <div className="ga-order-total">{o.currency} {Number(o.total).toFixed(2)}</div>
            </div>
            <div className="ga-order-meta">{new Date(o.created_at).toLocaleString()}</div>
            <table className="ga-receipt">
              <thead><tr><th>Item</th><th>Qty</th><th>Unit</th><th>Total</th></tr></thead>
              <tbody>
                {o.order_items.map((it: any) => (
                  <tr key={it.id}>
                    <td>{it.name}</td><td>{it.quantity}</td>
                    <td>{Number(it.unit_price).toFixed(2)}</td>
                    <td>{Number(it.line_total).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {o.shipping_address && <p className="ga-muted">Ship to: {o.shipping_address}</p>}
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              {STATUSES.map(s => (
                <button key={s} onClick={() => setStatus(o.id, s)} className={o.status === s ? "ga-btn-primary" : "ga-btn-ghost"}>{s}</button>
              ))}
            </div>
          </div>
        ))}
        {!orders?.length && <p className="ga-muted">No orders yet.</p>}
      </div>
    </>
  );
}