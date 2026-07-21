import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/parts")({
  component: AdminParts,
});

function AdminParts() {
  const qc = useQueryClient();
  const [form, setForm] = useState({ name: "", description: "", brand: "", category: "", price: "", stock: "", image_url: "" });
  const [editingId, setEditingId] = useState<string | null>(null);

  const { data: parts } = useQuery({
    queryKey: ["admin-parts"],
    queryFn: async () => {
      const { data, error } = await supabase.from("parts").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const reset = () => { setForm({ name: "", description: "", brand: "", category: "", price: "", stock: "", image_url: "" }); setEditingId(null); };

  const uploadImage = async (file: File) => {
    const path = `${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("product-images").upload(path, file);
    if (error) { toast.error(error.message); return; }
    const { data } = await supabase.storage.from("product-images").createSignedUrl(path, 60 * 60 * 24 * 365);
    if (data?.signedUrl) setForm(f => ({ ...f, image_url: data.signedUrl }));
  };

  const save = async () => {
    const payload = {
      name: form.name, description: form.description, brand: form.brand, category: form.category,
      price: Number(form.price), stock: Number(form.stock), image_url: form.image_url,
    };
    if (editingId) {
      const { error } = await supabase.from("parts").update(payload).eq("id", editingId);
      if (error) return toast.error(error.message);
      toast.success("Updated");
    } else {
      const { error } = await supabase.from("parts").insert(payload);
      if (error) return toast.error(error.message);
      toast.success("Added");
    }
    reset();
    qc.invalidateQueries({ queryKey: ["admin-parts"] });
  };

  const edit = (p: any) => {
    setEditingId(p.id);
    setForm({ name: p.name, description: p.description || "", brand: p.brand || "", category: p.category || "", price: String(p.price), stock: String(p.stock), image_url: p.image_url || "" });
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this part?")) return;
    const { error } = await supabase.from("parts").delete().eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["admin-parts"] });
  };

  const toggle = async (p: any) => {
    await supabase.from("parts").update({ active: !p.active }).eq("id", p.id);
    qc.invalidateQueries({ queryKey: ["admin-parts"] });
  };

  return (
    <>
      <h1>Spare Parts</h1>
      <div className="ga-admin-form">
        <h3>{editingId ? "Edit part" : "Add new part"}</h3>
        <div className="ga-form-grid">
          <label>Name<input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></label>
          <label>Brand<input value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })} /></label>
          <label>Category<input value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} /></label>
          <label>Price (CAD)<input type="number" step="0.01" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} /></label>
          <label>Stock<input type="number" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} /></label>
          <label className="ga-form-full">Description<textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></label>
          <label className="ga-form-full">Image<input type="file" accept="image/*" onChange={e => e.target.files && uploadImage(e.target.files[0])} />
            {form.image_url && <img src={form.image_url} alt="" style={{ marginTop: 8, maxHeight: 120, borderRadius: 8 }} />}
          </label>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="ga-btn-primary" onClick={save} disabled={!form.name || !form.price}>{editingId ? "Update" : "Add part"}</button>
          {editingId && <button className="ga-btn-ghost" onClick={reset}>Cancel</button>}
        </div>
      </div>

      <div className="ga-admin-list">
        {parts?.map((p: any) => (
          <div key={p.id} className="ga-admin-row">
            <img src={p.image_url || "/favicon.ico"} alt="" />
            <div>
              <strong>{p.name}</strong>
              <span className="ga-muted">{p.brand} · {p.category} · Stock: {p.stock} {!p.active && "· inactive"}</span>
            </div>
            <div className="ga-admin-price">CAD {Number(p.price).toFixed(2)}</div>
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