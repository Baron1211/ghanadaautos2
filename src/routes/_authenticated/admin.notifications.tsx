import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";

export const Route = createFileRoute("/_authenticated/admin/notifications")({
  component: AdminNotifications,
});

function AdminNotifications() {
  const qc = useQueryClient();

  // ---- Announcement banner ----
  const { data: anns } = useQuery({
    queryKey: ["admin-announcements"],
    queryFn: async () => {
      const { data, error } = await supabase.from("announcements").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
  });

  const [ann, setAnn] = useState({ message: "", link_url: "", link_label: "", style: "info" });
  const createAnn = async () => {
    if (!ann.message.trim()) return toast.error("Enter the banner message");
    const { error } = await supabase.from("announcements").insert({
      message: ann.message, link_url: ann.link_url || null, link_label: ann.link_label || null, style: ann.style, active: false,
    });
    if (error) return toast.error(error.message);
    toast.success("Banner created — switch it on to show it on the site");
    setAnn({ message: "", link_url: "", link_label: "", style: "info" });
    qc.invalidateQueries({ queryKey: ["admin-announcements"] });
  };

  const toggleAnn = async (id: string, active: boolean) => {
    if (active) await supabase.from("announcements").update({ active: false, updated_at: new Date().toISOString() }).neq("id", id);
    const { error } = await supabase.from("announcements").update({ active, updated_at: new Date().toISOString() }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(active ? "Banner is live on the website" : "Banner turned off");
    qc.invalidateQueries({ queryKey: ["admin-announcements"] });
  };

  const removeAnn = async (id: string) => {
    if (!confirm("Delete this banner?")) return;
    await supabase.from("announcements").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin-announcements"] });
  };

  // ---- Customer notifications ----
  const { data: customers } = useQuery({
    queryKey: ["admin-notify-customers"],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("id, full_name, phone").order("created_at", { ascending: false });
      return data || [];
    },
  });

  const [note, setNote] = useState({ user_id: "all", title: "", body: "", kind: "info", link_url: "" });
  const [sending, setSending] = useState(false);

  const send = async () => {
    if (!note.title.trim()) return toast.error("Enter a title");
    setSending(true);
    if (note.user_id === "all") {
      const { data, error } = await (supabase as any).rpc("broadcast_notification", {
        _title: note.title, _body: note.body || null, _kind: note.kind, _link: note.link_url || null,
      });
      setSending(false);
      if (error) return toast.error(error.message);
      toast.success(`Sent to ${data} customer${Number(data) === 1 ? "" : "s"}`);
    } else {
      const { error } = await supabase.from("notifications").insert({
        user_id: note.user_id, title: note.title, body: note.body || null, kind: note.kind, link_url: note.link_url || null,
      });
      setSending(false);
      if (error) return toast.error(error.message);
      toast.success("Notification sent");
    }
    setNote({ user_id: note.user_id, title: "", body: "", kind: "info", link_url: "" });
    qc.invalidateQueries({ queryKey: ["admin-sent-notifications"] });
  };

  const { data: sent } = useQuery({
    queryKey: ["admin-sent-notifications"],
    queryFn: async () => {
      const { data } = await supabase.from("notifications")
        .select("id, title, body, kind, read_at, created_at, user_id")
        .order("created_at", { ascending: false }).limit(30);
      return data || [];
    },
  });

  return (
    <>
      <h1>Notifications &amp; Announcements</h1>

      <div className="ga-admin-form">
        <h3>Website banner</h3>
        <p className="ga-muted ga-small">Shows at the very top of every public page. Only one banner can be live at a time.</p>
        <div className="ga-form-grid">
          <label className="ga-form-full">Message<input value={ann.message} onChange={(e) => setAnn({ ...ann, message: e.target.value })} placeholder="e.g. Free clearing on all China imports this month" /></label>
          <label>Link URL<input value={ann.link_url} onChange={(e) => setAnn({ ...ann, link_url: e.target.value })} placeholder="/import" /></label>
          <label>Link label<input value={ann.link_label} onChange={(e) => setAnn({ ...ann, link_label: e.target.value })} placeholder="Learn more" /></label>
          <label>Style
            <select value={ann.style} onChange={(e) => setAnn({ ...ann, style: e.target.value })}>
              <option value="info">Info (green)</option>
              <option value="promo">Promo (orange)</option>
              <option value="warning">Warning (amber)</option>
            </select>
          </label>
        </div>
        <button className="ga-btn-primary" onClick={createAnn}>Create banner</button>
      </div>

      <div className="ga-admin-list">
        {(anns || []).map((a: any) => (
          <div key={a.id} className="ga-admin-row">
            <div />
            <div>
              <strong>{a.message}</strong>
              <span className="ga-muted">{a.style}{a.link_url ? ` · ${a.link_url}` : ""}</span>
            </div>
            <div>{a.active ? <span className="ga-status ga-status-active">Live</span> : <span className="ga-status">Off</span>}</div>
            <div className="ga-admin-actions">
              <button className={a.active ? "" : "ga-btn-primary"} onClick={() => toggleAnn(a.id, !a.active)}>
                {a.active ? "Turn off" : "Turn on"}
              </button>
              <button className="ga-danger" onClick={() => removeAnn(a.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>

      <div className="ga-admin-form">
        <h3>Send a notification to customers</h3>
        <p className="ga-muted ga-small">Delivered inside the customer dashboard and the bell icon in the header.</p>
        <div className="ga-form-grid">
          <label>Recipient
            <select value={note.user_id} onChange={(e) => setNote({ ...note, user_id: e.target.value })}>
              <option value="all">All customers</option>
              {(customers || []).map((c: any) => <option key={c.id} value={c.id}>{c.full_name || c.id.slice(0, 8)}{c.phone ? ` · ${c.phone}` : ""}</option>)}
            </select>
          </label>
          <label>Type
            <select value={note.kind} onChange={(e) => setNote({ ...note, kind: e.target.value })}>
              <option value="info">General info</option>
              <option value="order">Order update</option>
              <option value="payment">Payment</option>
              <option value="shipment">Shipping / tracking</option>
            </select>
          </label>
          <label className="ga-form-full">Title<input value={note.title} onChange={(e) => setNote({ ...note, title: e.target.value })} /></label>
          <label className="ga-form-full">Message<textarea rows={3} value={note.body} onChange={(e) => setNote({ ...note, body: e.target.value })} /></label>
          <label className="ga-form-full">Link (optional)<input value={note.link_url} onChange={(e) => setNote({ ...note, link_url: e.target.value })} placeholder="/track?number=GA-123456" /></label>
        </div>
        <button className="ga-btn-primary" onClick={send} disabled={sending}>{sending ? "Sending…" : "Send notification"}</button>
      </div>

      <h3>Recently sent</h3>
      <div className="ga-admin-list">
        {(sent || []).map((n: any) => (
          <div key={n.id} className="ga-admin-row">
            <div />
            <div>
              <strong>{n.title}</strong>
              <span className="ga-muted">{n.body || "—"}</span>
            </div>
            <div className="ga-muted ga-small">{n.kind}</div>
            <div className="ga-muted ga-small">{n.read_at ? "Read" : "Unread"} · {new Date(n.created_at).toLocaleString()}</div>
          </div>
        ))}
      </div>
    </>
  );
}
