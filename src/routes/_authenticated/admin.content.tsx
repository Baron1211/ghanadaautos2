import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CMS_GROUPS, CMS_DEFAULTS, clearContentCache } from "@/lib/cms";

export const Route = createFileRoute("/_authenticated/admin/content")({
  component: AdminContent,
});

function AdminContent() {
  const [values, setValues] = useState<Record<string, Record<string, string>>>({});
  const [group, setGroup] = useState(CMS_GROUPS[0].key);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("site_content").select("key, value");
      const next: Record<string, Record<string, string>> = {};
      CMS_GROUPS.forEach((g) => {
        const row = (data || []).find((r: any) => r.key === g.key);
        next[g.key] = { ...(CMS_DEFAULTS[g.key] || {}), ...((row?.value as any) || {}) };
      });
      setValues(next);
    })();
  }, []);

  const current = CMS_GROUPS.find((g) => g.key === group)!;

  const set = (field: string, v: string) =>
    setValues((prev) => ({ ...prev, [group]: { ...(prev[group] || {}), [field]: v } }));

  const uploadImage = async (field: string, file: File) => {
    const path = `cms-${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("product-images").upload(path, file);
    if (error) return toast.error(error.message);
    const { data } = await supabase.storage.from("product-images").createSignedUrl(path, 60 * 60 * 24 * 365);
    if (data?.signedUrl) { set(field, data.signedUrl); toast.success("Image uploaded"); }
  };

  const save = async () => {
    setSaving(true);
    const { error } = await supabase.from("site_content").upsert(
      { key: group, value: values[group] || {}, updated_at: new Date().toISOString() },
      { onConflict: "key" },
    );
    setSaving(false);
    if (error) return toast.error(error.message);
    clearContentCache();
    toast.success("Website content updated");
  };

  const resetGroup = () => {
    setValues((prev) => ({ ...prev, [group]: { ...(CMS_DEFAULTS[group] || {}) } }));
    toast.info("Reset to defaults — remember to save");
  };

  return (
    <>
      <h1>Website Content</h1>
      <p className="ga-muted">Edit the text and images shown on the public website. Changes go live as soon as you save.</p>

      <div className="ga-cms">
        <div className="ga-cms-tabs">
          {CMS_GROUPS.map((g) => (
            <button key={g.key} className={g.key === group ? "active" : ""} onClick={() => setGroup(g.key)}>{g.label}</button>
          ))}
        </div>

        <div className="ga-admin-form">
          <h3>{current.label}</h3>
          {current.hint ? <p className="ga-muted ga-small">{current.hint}</p> : null}
          <div className="ga-form-grid">
            {current.fields.map((f) => (
              <label key={f.key} className={f.type === "text" ? "" : "ga-form-full"}>
                {f.label}
                {f.type === "textarea" ? (
                  <textarea rows={3} value={values[group]?.[f.key] ?? ""} onChange={(e) => set(f.key, e.target.value)} />
                ) : f.type === "image" ? (
                  <>
                    <input value={values[group]?.[f.key] ?? ""} onChange={(e) => set(f.key, e.target.value)} placeholder="Image URL" />
                    <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && uploadImage(f.key, e.target.files[0])} />
                    {values[group]?.[f.key] ? <img src={values[group][f.key]} alt="" className="ga-cms-thumb" /> : null}
                  </>
                ) : (
                  <input value={values[group]?.[f.key] ?? ""} onChange={(e) => set(f.key, e.target.value)} />
                )}
              </label>
            ))}
          </div>
          <div className="ga-admin-actions">
            <button className="ga-btn-primary" onClick={save} disabled={saving}>{saving ? "Saving…" : "Save changes"}</button>
            <button onClick={resetGroup}>Reset to default</button>
          </div>
        </div>
      </div>
    </>
  );
}
