import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";

export const Route = createFileRoute("/_authenticated/admin/repairs")({
  component: AdminRepairs,
});

const STATUSES = ["new", "reviewing", "quoted", "scheduled", "completed", "cancelled"];

function AdminRepairs() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState<string>("all");

  const { data: rows } = useQuery({
    queryKey: ["admin-repairs"],
    queryFn: async () => {
      const { data, error } = await supabase.from("repair_requests").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
  });

  const update = async (id: string, patch: any) => {
    const { error } = await supabase.from("repair_requests").update(patch).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Request updated");
    qc.invalidateQueries({ queryKey: ["admin-repairs"] });
  };

  const list = (rows || []).filter((r) => filter === "all" || r.status === filter);

  return (
    <>
      <h1>Repair Requests</h1>
      <div className="ga-admin-filters">
        <button className={filter === "all" ? "active" : ""} onClick={() => setFilter("all")}>All ({rows?.length || 0})</button>
        {STATUSES.map((s) => (
          <button key={s} className={filter === s ? "active" : ""} onClick={() => setFilter(s)}>
            {s} ({(rows || []).filter((r) => r.status === s).length})
          </button>
        ))}
      </div>

      <div className="ga-admin-list">
        {list.length === 0 && <p className="ga-muted">No repair requests here.</p>}
        {list.map((r) => (
          <div key={r.id} className="ga-repair-row">
            <div className="ga-repair-main">
              <div className="ga-repair-top">
                <strong>{r.request_number}</strong>
                <span className={`ga-status ga-status-${r.status}`}>{r.status}</span>
                <span className="ga-muted ga-small">{new Date(r.created_at).toLocaleString()}</span>
              </div>
              <div className="ga-repair-grid">
                <div><span>Customer</span><b>{r.customer_name}</b></div>
                <div><span>Phone</span><b><a href={`tel:${r.customer_phone}`}>{r.customer_phone}</a></b></div>
                <div><span>Email</span><b>{r.customer_email || "—"}</b></div>
                <div><span>Vehicle</span><b>{[r.year, r.make, r.model].filter(Boolean).join(" ") || r.vehicle_type}</b></div>
                <div><span>Type</span><b>{r.vehicle_type}</b></div>
                <div><span>Part to repair</span><b>{r.part}</b></div>
                <div><span>Service</span><b>{r.service || "—"}</b></div>
                <div><span>Preferred</span><b>{r.preferred_date ? `${r.preferred_date} ${r.preferred_time || ""}` : "—"}</b></div>
                <div><span>Location</span><b>{r.location || "—"}</b></div>
              </div>
              {r.notes ? <p className="ga-repair-notes">“{r.notes}”</p> : null}
            </div>
            <div className="ga-repair-actions">
              <label>Status
                <select value={r.status} onChange={(e) => update(r.id, { status: e.target.value })}>
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </label>
              <label>Quote (GHS)
                <input type="number" step="0.01" defaultValue={r.quote_amount ?? ""} placeholder="—"
                  onBlur={(e) => {
                    const v = e.target.value ? Number(e.target.value) : null;
                    if (v !== (r.quote_amount ?? null)) update(r.id, { quote_amount: v });
                  }} />
              </label>
              <label>Internal notes
                <textarea defaultValue={r.admin_notes || ""} rows={2}
                  onBlur={(e) => { if (e.target.value !== (r.admin_notes || "")) update(r.id, { admin_notes: e.target.value }); }} />
              </label>
              {r.customer_phone && (
                <a className="ga-admin-chip" href={`https://wa.me/${r.customer_phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer">WhatsApp customer</a>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
