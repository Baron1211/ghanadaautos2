import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { X, Megaphone } from "lucide-react";

type Ann = { id: string; message: string; link_url: string | null; link_label: string | null; style: string };

export default function AnnouncementBanner() {
  const [ann, setAnn] = useState<Ann | null>(null);
  const [closed, setClosed] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("announcements")
        .select("id, message, link_url, link_label, style")
        .eq("active", true)
        .order("updated_at", { ascending: false })
        .limit(1);
      const row = (data || [])[0] as Ann | undefined;
      if (!row) return;
      const dismissed = typeof window !== "undefined" && localStorage.getItem("ga_ann_dismissed") === row.id;
      setAnn(row);
      setClosed(dismissed);
    })();
  }, []);

  if (!ann || closed) return null;

  return (
    <div className={`ga-announce ga-announce-${ann.style || "info"}`}>
      <div className="ga-announce-inner">
        <Megaphone size={16} />
        <span>{ann.message}</span>
        {ann.link_url ? (
          <a href={ann.link_url}>{ann.link_label || "Learn more"} →</a>
        ) : null}
      </div>
      <button
        type="button"
        aria-label="Dismiss announcement"
        onClick={() => { localStorage.setItem("ga_ann_dismissed", ann.id); setClosed(true); }}
      >
        <X size={15} />
      </button>
    </div>
  );
}
