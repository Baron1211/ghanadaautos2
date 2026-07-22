import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/bookings")({
  component: AdminBookings,
});

const STATUSES = ["pending", "confirmed", "active", "completed", "cancelled"];

function AdminBookings() {
  const qc = useQueryClient();
  const { data: bookings } = useQuery({
    queryKey: ["admin-bookings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("rental_bookings")
        .select("*, rental:rentals(name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const setStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("rental_bookings").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Booking updated");
    qc.invalidateQueries({ queryKey: ["admin-bookings"] });
  };

  const setPaid = async (id: string, paid: boolean) => {
    await supabase.from("rental_bookings").update({ payment_status: paid ? "paid" : "unpaid" }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin-bookings"] });
  };

  return (
    <>
      <h1>Rental Bookings</h1>
      <div className="ga-order-list">
        {bookings?.map((b: any) => (
          <div key={b.id} className="ga-order-card">
            <div className="ga-order-head">
              <div>
                <strong>{b.booking_number}</strong>
                <span className="ga-muted">{b.rental?.name} · {b.guest_name} · {b.guest_email} · {b.guest_phone}</span>
              </div>
              <div className="ga-order-total">{b.currency} {Number(b.total).toFixed(2)}</div>
            </div>
            <div className="ga-order-meta">
              {b.pickup_date} → {b.return_date} ({b.days}d) · {b.with_driver ? "With driver" : "Self-drive"} · Dest: {b.destination || "—"}
            </div>
            <p className="ga-muted">Payment: {b.payment_status} {b.notes ? `· Notes: ${b.notes}` : ""}</p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
              {STATUSES.map(s => (
                <button key={s} onClick={() => setStatus(b.id, s)} className={b.status === s ? "ga-btn-primary" : "ga-btn-ghost"}>{s}</button>
              ))}
              <button onClick={() => setPaid(b.id, b.payment_status !== "paid")} className="ga-btn-ghost">
                {b.payment_status === "paid" ? "Mark unpaid" : "Mark paid"}
              </button>
            </div>
          </div>
        ))}
        {!bookings?.length && <p className="ga-muted">No bookings yet.</p>}
      </div>
    </>
  );
}