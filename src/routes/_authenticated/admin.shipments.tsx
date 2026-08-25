import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";

export const Route = createFileRoute("/_authenticated/admin/shipments")({
  component: AdminShipments,
});

const STATUSES = ["pending", "processing", "shipped", "in_transit", "customs", "arrived", "out_for_delivery", "delivered", "cancelled"];

const emptyShipment = {
  tracking_number: "", order_id: "", user_id: "", customer_name: "", customer_email: "",
  description: "", carrier: "", status: "pending", current_location: "", eta: "",
};

function AdminShipments() {
  const qc = useQueryClient();
  const [form, setForm] = useState({ ...emptyShipment });
  const [saving, setSaving] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);

  const { data: shipments } = useQuery({
    queryKey: ["admin-shipments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("shipments")
        .select("*, events:shipment_events(id, status, location, message, happened_at)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
  });

  const { data: orders } = useQuery({
    queryKey: ["admin-shipment-orders"],
    queryFn: async () => {
      const { data } = await supabase
        .from("orders")
        .select("id, order_number, guest_name, guest_email, user_id")
        .order("created_at", { ascending: false }).limit(100);
      return data || [];
    },
  });

  const genNumber = () => `GA-${Math.random().toString(36).slice(2, 8).toUpperCase()}${Date.now().toString().slice(-3)}`;

  const create = async () => {
    if (!form.customer_name) return toast.error("Customer name is required");
    setSaving(true);
    const order = (orders || []).find((o: any) => o.id === form.order_id);
    const payload: any = {
      tracking_number: form.tracking_number.trim() || genNumber(),
      order_id: form.order_id || null,
      user_id: form.user_id || order?.user_id || null,
      customer_name: form.customer_name,
      customer_email: form.customer_email || null,
      description: form.description || null,
      carrier: form.carrier || null,
      status: form.status,
      current_location: form.current_location || null,
      eta: form.eta || null,
    };
    const { error } = await supabase.from("shipments").insert(payload);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(`Shipment ${payload.tracking_number} created`);
    setForm({ ...emptyShipment });
    qc.invalidateQueries({ queryKey: ["admin-shipments"] });
  };

  const patch = async (id: string, p: any) => {
    const { error } = await supabase.from("shipments").update(p).eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["admin-shipments"] });
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this shipment and its updates?")) return;
    const { error } = await supabase.from("shipments").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Shipment deleted");
    qc.invalidateQueries({ queryKey: ["admin-shipments"] });
  };

  return (
    <>
      <h1>Tracking &amp; Shipments</h1>

      <div className="ga-admin-form">
        <h3>Create tracking record</h3>
        <div className="ga-form-grid">
          <label>Tracking number<input value={form.tracking_number} onChange={(e) => setForm({ ...form, tracking_number: e.target.value })} placeholder="Auto-generated if blank" /></label>
          <label>Link to order
            <select value={form.order_id} onChange={(e) => {
              const o: any = (orders || []).find((x: any) => x.id === e.target.value);
              setForm({
                ...form, order_id: e.target.value,
                customer_name: o?.guest_name || form.customer_name,
                customer_email: o?.guest_email || form.customer_email,
                user_id: o?.user_id || "",
              });
            }}>
              <option value="">Standalone shipment</option>
              {(orders || []).map((o: any) => <option key={o.id} value={o.id}>{o.order_number}{o.guest_name ? ` — ${o.guest_name}` : ""}</option>)}
            </select>
          </label>
          <label>Customer name<input value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} /></label>
          <label>Customer email<input value={form.customer_email} onChange={(e) => setForm({ ...form, customer_email: e.target.value })} /></label>
          <label>Carrier<input value={form.carrier} onChange={(e) => setForm({ ...form, carrier: e.target.value })} placeholder="e.g. Maersk, DHL" /></label>
          <label>Status
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              {STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
            </select>
          </label>
          <label>Current location<input value={form.current_location} onChange={(e) => setForm({ ...form, current_location: e.target.value })} /></label>
          <label>ETA<input type="date" value={form.eta} onChange={(e) => setForm({ ...form, eta: e.target.value })} /></label>
          <label className="ga-form-full">Description<input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="e.g. 2019 Toyota Highlander — Toronto to Takoradi" /></label>
        </div>
        <button className="ga-btn-primary" onClick={create} disabled={saving}>{saving ? "Saving…" : "Create shipment"}</button>
      </div>

      <div className="ga-admin-list">
        {(shipments || []).map((s: any) => (
          <div key={s.id} className="ga-ship-row">
            <div className="ga-ship-head">
              <div>
                <strong>{s.tracking_number}</strong>
                <span className="ga-muted ga-small"> · {s.customer_name || "—"} · {s.description || "No description"}</span>
              </div>
              <span className={`ga-status ga-status-${s.status}`}>{String(s.status).replace(/_/g, " ")}</span>
              <div className="ga-admin-actions">
                <button onClick={() => setOpenId(openId === s.id ? null : s.id)}>{openId === s.id ? "Close" : "Manage"}</button>
                <button className="ga-danger" onClick={() => remove(s.id)}>Delete</button>
              </div>
            </div>

            {openId === s.id && (
              <div className="ga-ship-body">
                <div className="ga-form-grid">
                  <label>Status
                    <select value={s.status} onChange={(e) => patch(s.id, { status: e.target.value })}>
                      {STATUSES.map((x) => <option key={x} value={x}>{x.replace(/_/g, " ")}</option>)}
                    </select>
                  </label>
                  <label>Current location<input defaultValue={s.current_location || ""} onBlur={(e) => patch(s.id, { current_location: e.target.value })} /></label>
                  <label>Carrier<input defaultValue={s.carrier || ""} onBlur={(e) => patch(s.id, { carrier: e.target.value })} /></label>
                  <label>ETA<input type="date" defaultValue={s.eta || ""} onChange={(e) => patch(s.id, { eta: e.target.value || null })} /></label>
                </div>

                <AddEvent shipmentId={s.id} userId={s.user_id} tracking={s.tracking_number} onDone={() => qc.invalidateQueries({ queryKey: ["admin-shipments"] })} />

                <h4>Update history</h4>
                {(s.events || []).length === 0 ? <p className="ga-muted">No updates yet.</p> : (
                  <ul className="ga-ship-events">
                    {[...s.events].sort((a: any, b: any) => (a.happened_at < b.happened_at ? 1 : -1)).map((e: any) => (
                      <li key={e.id}>
                        <strong>{String(e.status).replace(/_/g, " ")}</strong>
                        {e.location ? <span className="ga-muted"> · {e.location}</span> : null}
                        {e.message ? <p>{e.message}</p> : null}
                        <small>{new Date(e.happened_at).toLocaleString()}</small>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}

function AddEvent({ shipmentId, userId, tracking, onDone }: { shipmentId: string; userId: string | null; tracking: string; onDone: () => void }) {
  const [ev, setEv] = useState({ status: "in_transit", location: "", message: "" });
  const [notify, setNotify] = useState(true);
  const [busy, setBusy] = useState(false);

  const add = async () => {
    setBusy(true);
    const { error } = await supabase.from("shipment_events").insert({
      shipment_id: shipmentId, status: ev.status, location: ev.location || null, message: ev.message || null,
    });
    if (!error) {
      await supabase.from("shipments").update({
        status: ev.status, current_location: ev.location || null,
      }).eq("id", shipmentId);
      if (notify && userId) {
        await supabase.from("notifications").insert({
          user_id: userId,
          title: `Shipment ${tracking}: ${ev.status.replace(/_/g, " ")}`,
          body: [ev.location, ev.message].filter(Boolean).join(" — ") || null,
          kind: "shipment",
          link_url: `/track?number=${tracking}`,
        });
      }
    }
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Update added");
    setEv({ status: "in_transit", location: "", message: "" });
    onDone();
  };

  return (
    <div className="ga-ship-addevent">
      <h4>Add tracking update</h4>
      <div className="ga-form-grid">
        <label>Status
          <select value={ev.status} onChange={(e) => setEv({ ...ev, status: e.target.value })}>
            {STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
          </select>
        </label>
        <label>Location<input value={ev.location} onChange={(e) => setEv({ ...ev, location: e.target.value })} placeholder="e.g. Tema Port, Ghana" /></label>
        <label className="ga-form-full">Message to customer<input value={ev.message} onChange={(e) => setEv({ ...ev, message: e.target.value })} /></label>
      </div>
      <label className="ga-check">
        <input type="checkbox" checked={notify} onChange={(e) => setNotify(e.target.checked)} disabled={!userId} />
        Notify the signed-in customer{userId ? "" : " (no account linked)"}
      </label>
      <button className="ga-btn-primary" onClick={add} disabled={busy}>{busy ? "Saving…" : "Add update"}</button>
    </div>
  );
}
