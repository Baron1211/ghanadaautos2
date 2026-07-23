import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ImageGalleryEditor } from "@/components/admin/ImageGalleryEditor";
import { GalleryImage, normalizeImages, serializeImages } from "@/lib/images";

export const Route = createFileRoute("/_authenticated/admin/parts")({
  component: AdminParts,
});

function AdminParts() {
  const qc = useQueryClient();
  const emptyForm = { name: "", description: "", brand: "", category: "", brand_id: "", category_id: "", price: "", stock: "", low_stock_threshold: "5", image_url: "", images: [] as GalleryImage[] };
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("");
  const [filterBrand, setFilterBrand] = useState("");
  const [filterStock, setFilterStock] = useState<"all" | "low" | "out">("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const { data: parts } = useQuery({
    queryKey: ["admin-parts"],
    queryFn: async () => {
      const { data, error } = await supabase.from("parts").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: categories } = useQuery({
    queryKey: ["cat-options"],
    queryFn: async () => ((await (supabase as any).from("categories").select("id,name").order("name")).data || []) as any[],
  });
  const { data: brands } = useQuery({
    queryKey: ["brand-options"],
    queryFn: async () => ((await (supabase as any).from("brands").select("id,name").order("name")).data || []) as any[],
  });

  const reset = () => { setForm(emptyForm); setEditingId(null); };

  const save = async () => {
    const payload: any = {
      name: form.name, description: form.description, brand: form.brand, category: form.category,
      brand_id: form.brand_id || null, category_id: form.category_id || null,
      price: Number(form.price), stock: Number(form.stock), image_url: form.image_url,
      low_stock_threshold: Number(form.low_stock_threshold || 5),
      images: serializeImages(form.images),
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
    setForm({
      name: p.name, description: p.description || "", brand: p.brand || "", category: p.category || "",
      brand_id: p.brand_id || "", category_id: p.category_id || "",
      price: String(p.price), stock: String(p.stock),
      low_stock_threshold: String(p.low_stock_threshold ?? 5),
      image_url: p.image_url || "",
      images: normalizeImages(p.images, p.image_url),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
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

  const filtered = useMemo(() => {
    const list = (parts as any[]) || [];
    return list.filter((p: any) => {
      if (search && !`${p.name} ${p.brand ?? ""} ${p.category ?? ""}`.toLowerCase().includes(search.toLowerCase())) return false;
      if (filterCat && p.category_id !== filterCat) return false;
      if (filterBrand && p.brand_id !== filterBrand) return false;
      if (filterStock === "out" && p.stock > 0) return false;
      if (filterStock === "low" && !(p.stock > 0 && p.stock <= (p.low_stock_threshold ?? 5))) return false;
      return true;
    });
  }, [parts, search, filterCat, filterBrand, filterStock]);

  const toggleSel = (id: string) => {
    const n = new Set(selected);
    n.has(id) ? n.delete(id) : n.add(id);
    setSelected(n);
  };
  const selectAll = () => setSelected(new Set(filtered.map((p: any) => p.id)));
  const clearSel = () => setSelected(new Set());
  const bulk = async (patch: any, msg: string) => {
    if (!selected.size) return;
    const { error } = await supabase.from("parts").update(patch).in("id", Array.from(selected));
    if (error) return toast.error(error.message);
    toast.success(`${selected.size} ${msg}`);
    clearSel();
    qc.invalidateQueries({ queryKey: ["admin-parts"] });
  };
  const bulkDelete = async () => {
    if (!selected.size || !confirm(`Delete ${selected.size} parts?`)) return;
    const { error } = await supabase.from("parts").delete().in("id", Array.from(selected));
    if (error) return toast.error(error.message);
    toast.success(`${selected.size} deleted`);
    clearSel();
    qc.invalidateQueries({ queryKey: ["admin-parts"] });
  };

  return (
    <>
      <h1>Spare Parts</h1>
      <div className="ga-admin-form">
        <h3>{editingId ? "Edit part" : "Add new part"}</h3>
        <div className="ga-form-grid">
          <label>Name<input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></label>
          <label>Brand
            <select value={form.brand_id} onChange={e => {
              const b = brands?.find((x: any) => x.id === e.target.value);
              setForm({ ...form, brand_id: e.target.value, brand: b?.name || "" });
            }}>
              <option value="">— Select brand —</option>
              {brands?.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </label>
          <label>Category
            <select value={form.category_id} onChange={e => {
              const c = categories?.find((x: any) => x.id === e.target.value);
              setForm({ ...form, category_id: e.target.value, category: c?.name || "" });
            }}>
              <option value="">— Select category —</option>
              {categories?.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </label>
          <label>Price (GHS)<input type="number" step="0.01" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} /></label>
          <label>Stock<input type="number" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} /></label>
          <label>Low-stock alert at<input type="number" value={form.low_stock_threshold} onChange={e => setForm({ ...form, low_stock_threshold: e.target.value })} /></label>
          <label className="ga-form-full">Description<textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></label>
          <div className="ga-form-full">
            <label>Images (up to 20, first is primary, add captions per image)</label>
            <ImageGalleryEditor
              images={form.images}
              primaryUrl={form.image_url}
              onChange={(images, primary) => setForm(f => ({ ...f, images, image_url: primary }))}
              bucketPrefix="part"
            />
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="ga-btn-primary" onClick={save} disabled={!form.name || !form.price}>{editingId ? "Update" : "Add part"}</button>
          {editingId && <button className="ga-btn-ghost" onClick={reset}>Cancel</button>}
        </div>
      </div>

      <div className="ga-admin-form" style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
        <input placeholder="Search parts…" value={search} onChange={e => setSearch(e.target.value)} style={{ flex: "1 1 200px", minWidth: 180 }} />
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)}>
          <option value="">All categories</option>
          {categories?.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={filterBrand} onChange={e => setFilterBrand(e.target.value)}>
          <option value="">All brands</option>
          {brands?.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
        <select value={filterStock} onChange={e => setFilterStock(e.target.value as any)}>
          <option value="all">All stock</option>
          <option value="low">Low stock</option>
          <option value="out">Out of stock</option>
        </select>
        <span className="ga-admin-mini">{filtered.length} of {parts?.length ?? 0}</span>
      </div>

      {selected.size > 0 && (
        <div className="ga-admin-form" style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", background: "#fff8e1" }}>
          <strong>{selected.size} selected</strong>
          <button onClick={() => bulk({ active: true }, "activated")}>Activate</button>
          <button onClick={() => bulk({ active: false }, "deactivated")}>Deactivate</button>
          <button className="ga-danger" onClick={bulkDelete}>Delete</button>
          <button className="ga-btn-ghost" onClick={clearSel}>Clear</button>
        </div>
      )}

      <div className="ga-admin-list">
        {filtered.length > 0 && (
          <div style={{ padding: "0 8px" }}>
            <label style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 13 }}>
              <input type="checkbox" checked={selected.size === filtered.length} onChange={e => e.target.checked ? selectAll() : clearSel()} />
              Select all visible
            </label>
          </div>
        )}
        {filtered.map((p: any) => (
          <PartRow key={p.id} p={p} selected={selected.has(p.id)} onSelect={() => toggleSel(p.id)} onEdit={edit} onToggle={toggle} onRemove={remove} />
        ))}
        {!filtered.length && <p className="ga-admin-empty">No parts match your filters.</p>}
      </div>
    </>
  );
}

function PartRow({ p, selected, onSelect, onEdit, onToggle, onRemove }: { p: any; selected: boolean; onSelect: () => void; onEdit: (p: any) => void; onToggle: (p: any) => void; onRemove: (id: string) => void }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const lowStock = p.stock > 0 && p.stock <= (p.low_stock_threshold ?? 5);
  const outStock = p.stock === 0;
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
        <input type="checkbox" checked={selected} onChange={onSelect} style={{ marginRight: 4 }} />
        <img src={p.image_url || "/favicon.ico"} alt="" />
        <div>
          <strong>{p.name}</strong>
          <span className="ga-muted">
            {p.brand || "—"} · {p.category || "—"} · Stock: {p.stock}
            {outStock && <span style={{ color: "#c00", fontWeight: 600 }}> · OUT OF STOCK</span>}
            {lowStock && <span style={{ color: "#c60", fontWeight: 600 }}> · LOW</span>}
            {!p.active && " · inactive"}
          </span>
        </div>
        <div className="ga-admin-price">GHS {Number(p.price).toFixed(2)}</div>
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