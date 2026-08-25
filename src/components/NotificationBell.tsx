import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Bell } from "lucide-react";

type Note = { id: string; title: string; body: string | null; kind: string; link_url: string | null; read_at: string | null; created_at: string };

export default function NotificationBell() {
  const [userId, setUserId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setUserId(s?.user?.id ?? null));
    return () => sub.subscription.unsubscribe();
  }, []);

  const load = async (uid: string) => {
    const { data } = await supabase
      .from("notifications")
      .select("id, title, body, kind, link_url, read_at, created_at")
      .eq("user_id", uid)
      .order("created_at", { ascending: false })
      .limit(15);
    setNotes((data || []) as Note[]);
  };

  useEffect(() => {
    if (!userId) { setNotes([]); return; }
    load(userId);
    const t = setInterval(() => load(userId), 60000);
    return () => clearInterval(t);
  }, [userId]);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  if (!userId) return null;
  const unread = notes.filter((n) => !n.read_at).length;

  const markAllRead = async () => {
    if (!unread) return;
    await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("user_id", userId).is("read_at", null);
    load(userId);
  };

  return (
    <div className={`ga-bell${open ? " is-open" : ""}`} ref={ref}>
      <button type="button" className="icon-btn" aria-label="Notifications" onClick={() => setOpen((v) => !v)}>
        <Bell size={18} />
        {unread > 0 && <span className="ga-bell-dot">{unread > 9 ? "9+" : unread}</span>}
      </button>
      {open && (
        <div className="ga-bell-panel">
          <div className="ga-bell-head">
            <strong>Notifications</strong>
            <button type="button" onClick={markAllRead} disabled={!unread}>Mark all read</button>
          </div>
          {notes.length === 0 ? (
            <p className="ga-bell-empty">No notifications yet.</p>
          ) : (
            <ul className="ga-bell-list">
              {notes.map((n) => (
                <li key={n.id} className={n.read_at ? "" : "is-unread"}>
                  <span className={`ga-bell-kind ga-bell-kind-${n.kind}`} />
                  <div>
                    <strong>{n.title}</strong>
                    {n.body ? <p>{n.body}</p> : null}
                    {n.link_url ? <a href={n.link_url}>View →</a> : null}
                    <small>{new Date(n.created_at).toLocaleString()}</small>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
