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
          <PartRow key={p.id} p={p} onEdit={edit} onToggle={toggle} onRemove={remove} />
        ))}
      </div>
    </>
  );
}

function PartRow({ p, onEdit, onToggle, onRemove }: { p: any; onEdit: (p: any) => void; onToggle: (p: any) => void; onRemove: (id: string) => void }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const { data: vars } = useQuery({
    queryKey: ["variations", p.id],
    enabled: open,
    queryFn: async () => {
      const { data } = await supabase.from("part_variations").select("*").eq("part_id", p.id).order("sort_order");
      return data || [];
    },
  });
  const [nv, setNv] = useState({ label: "", price: "", stock: "", attributes: "" });

  const addVar = async () => {
    if (!nv.label || !nv.price) return toast.error("Label and price required");
    let attrs: any = {};
    try { attrs = nv.attributes ? JSON.parse(nv.attributes) : {}; } catch { return toast.error("Attributes must be valid JSON"); }
    const { error } = await supabase.from("part_variations").insert({
      part_id: p.id, label: nv.label, price: Number(nv.price), stock: Number(nv.stock || 0), attributes: attrs,
    });
    if (error) return toast.error(error.message);
    setNv({ label: "", price: "", stock: "", attributes: "" });
    qc.invalidateQueries({ queryKey: ["variations", p.id] });
  };
  const delVar = async (id: string) => {
    if (!confirm("Delete variation?")) return;
    await supabase.from("part_variations").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["variations", p.id] });
  };
  const updateVar = async (id: string, patch: any) => {
    await supabase.from("part_variations").update(patch).eq("id", id);
    qc.invalidateQueries({ queryKey: ["variations", p.id] });
  };

  return (
    <div className="ga-admin-row-wrap">
      <div className="ga-admin-row">
        <img src={p.image_url || "/favicon.ico"} alt="" />
        <div>
          <strong>{p.name}</strong>
          <span className="ga-muted">{p.brand} · {p.category} · Stock: {p.stock} {!p.active && "· inactive"}</span>
        </div>
        <div className="ga-admin-price">CAD {Number(p.price).toFixed(2)}</div>
        <div className="ga-admin-actions">
          <button onClick={() => setOpen(o => !o)}>{open ? "Hide variations" : "Variations"}</button>
          <button onClick={() => onEdit(p)}>Edit</button>
          <button onClick={() => onToggle(p)}>{p.active ? "Hide" : "Show"}</button>
          <button onClick={() => onRemove(p.id)} className="ga-danger">Delete</button>
        </div>
      </div>
      {open && (
        <div className="ga-variations-panel">
          <h4>Variations (e.g. sizes, fitments)</h4>
          {vars?.length ? (
            <table className="ga-var-table">
              <thead><tr><th>Label</th><th>Price</th><th>Stock</th><th>Attributes</th><th></th></tr></thead>
              <tbody>
                {vars.map((v: any) => (
                  <tr key={v.id}>
                    <td><input defaultValue={v.label} onBlur={e => updateVar(v.id, { label: e.target.value })} /></td>
                    <td><input type="number" step="0.01" defaultValue={v.price} onBlur={e => updateVar(v.id, { price: Number(e.target.value) })} /></td>
                    <td><input type="number" defaultValue={v.stock} onBlur={e => updateVar(v.id, { stock: Number(e.target.value) })} /></td>
                    <td><code>{JSON.stringify(v.attributes)}</code></td>
                    <td><button className="ga-danger" onClick={() => delVar(v.id)}>×</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <p className="ga-muted ga-small">No variations. Add one below to offer per-size or per-model pricing.</p>}
          <div className="ga-form-grid" style={{ marginTop: 12 }}>
            <label>Label<input value={nv.label} onChange={e => setNv({ ...nv, label: e.target.value })} placeholder="e.g. 205/55R16" /></label>
            <label>Price<input type="number" step="0.01" value={nv.price} onChange={e => setNv({ ...nv, price: e.target.value })} /></label>
            <label>Stock<input type="number" value={nv.stock} onChange={e => setNv({ ...nv, stock: e.target.value })} /></label>
            <label>Attributes JSON<input value={nv.attributes} onChange={e => setNv({ ...nv, attributes: e.target.value })} placeholder='{"fits":"Toyota Corolla 2015"}' /></label>
          </div>
          <button className="ga-btn-primary" onClick={addVar}>Add variation</button>
        </div>
      )}
    </div>
  );
}