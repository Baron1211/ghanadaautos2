import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/rentals")({
  component: AdminRentals,
});

function AdminRentals() {
  const qc = useQueryClient();
  const [form, setForm] = useState({ name: "", description: "", vehicle_type: "", daily_rate: "", image_url: "" });
  const [editingId, setEditingId] = useState<string | null>(null);

  const { data: items } = useQuery({
    queryKey: ["admin-rentals"],
    queryFn: async () => {
      const { data, error } = await supabase.from("rentals").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const reset = () => { setForm({ name: "", description: "", vehicle_type: "", daily_rate: "", image_url: "" }); setEditingId(null); };

  const uploadImage = async (file: File) => {
    const path = `${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("product-images").upload(path, file);
    if (error) { toast.error(error.message); return; }
    const { data } = await supabase.storage.from("product-images").createSignedUrl(path, 60 * 60 * 24 * 365);
    if (data?.signedUrl) setForm(f => ({ ...f, image_url: data.signedUrl }));
  };

  const save = async () => {
    const payload = { name: form.name, description: form.description, vehicle_type: form.vehicle_type, daily_rate: Number(form.daily_rate), image_url: form.image_url };
    const res = editingId
      ? await supabase.from("rentals").update(payload).eq("id", editingId)
      : await supabase.from("rentals").insert(payload);
    if (res.error) return toast.error(res.error.message);
    toast.success(editingId ? "Updated" : "Added");
    reset();
    qc.invalidateQueries({ queryKey: ["admin-rentals"] });
  };

  const edit = (p: any) => { setEditingId(p.id); setForm({ name: p.name, description: p.description || "", vehicle_type: p.vehicle_type || "", daily_rate: String(p.daily_rate), image_url: p.image_url || "" }); };
  const remove = async (id: string) => {
    if (!confirm("Delete this rental?")) return;
    await supabase.from("rentals").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin-rentals"] });
  };
  const toggle = async (r: any) => { await supabase.from("rentals").update({ active: !r.active }).eq("id", r.id); qc.invalidateQueries({ queryKey: ["admin-rentals"] }); };

  return (
    <>
      <h1>Rental Vehicles</h1>
      <div className="ga-admin-form">
        <h3>{editingId ? "Edit rental" : "Add rental"}</h3>
        <div className="ga-form-grid">
          <label>Name<input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></label>
          <label>Vehicle type<input value={form.vehicle_type} onChange={e => setForm({ ...form, vehicle_type: e.target.value })} /></label>
          <label>Daily rate (CAD)<input type="number" step="0.01" value={form.daily_rate} onChange={e => setForm({ ...form, daily_rate: e.target.value })} /></label>
          <label className="ga-form-full">Description<textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></label>
          <label className="ga-form-full">Image<input type="file" accept="image/*" onChange={e => e.target.files && uploadImage(e.target.files[0])} />
            {form.image_url && <img src={form.image_url} alt="" style={{ marginTop: 8, maxHeight: 120, borderRadius: 8 }} />}
          </label>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="ga-btn-primary" onClick={save} disabled={!form.name || !form.daily_rate}>{editingId ? "Update" : "Add rental"}</button>
          {editingId && <button className="ga-btn-ghost" onClick={reset}>Cancel</button>}
        </div>
      </div>

      <div className="ga-admin-list">
        {items?.map((p: any) => (
          <div key={p.id} className="ga-admin-row">
            <img src={p.image_url || "/favicon.ico"} alt="" />
            <div><strong>{p.name}</strong><span className="ga-muted">{p.vehicle_type} {!p.active && "· inactive"}</span></div>
            <div className="ga-admin-price">CAD {Number(p.daily_rate).toFixed(2)} / day</div>
            <div className="ga-admin-actions">
              <button onClick={() => edit(p)}>Edit</button>
              <button onClick={() => toggle(p)}>{p.active ? "Hide" : "Show"}</button>
              <button onClick={() => remove(p.id)} className="ga-danger">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}