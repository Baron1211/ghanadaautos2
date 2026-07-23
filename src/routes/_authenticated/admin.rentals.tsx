import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ImageGalleryEditor } from "@/components/admin/ImageGalleryEditor";
import { GalleryImage, normalizeImages, serializeImages } from "@/lib/images";

export const Route = createFileRoute("/_authenticated/admin/rentals")({
  component: AdminRentals,
});

function AdminRentals() {
  const qc = useQueryClient();
  const empty = { name: "", description: "", vehicle_type: "", daily_rate: "", seats: "", transmission: "Automatic", fuel: "Petrol", features: "", image_url: "", images: [] as GalleryImage[] };
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const { data: items } = useQuery({
    queryKey: ["admin-rentals"],
    queryFn: async () => {
      const { data, error } = await supabase.from("rentals").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const reset = () => { setForm(empty); setEditingId(null); };

  const save = async () => {
    const payload: any = {
      name: form.name, description: form.description, vehicle_type: form.vehicle_type,
      daily_rate: Number(form.daily_rate),
      seats: form.seats ? Number(form.seats) : null,
      transmission: form.transmission || null,
      fuel: form.fuel || null,
      features: form.features ? form.features.split(",").map(s => s.trim()).filter(Boolean) : [],
      image_url: form.image_url, images: serializeImages(form.images),
    };
    const res = editingId
      ? await supabase.from("rentals").update(payload).eq("id", editingId)
      : await supabase.from("rentals").insert(payload);
    if (res.error) return toast.error(res.error.message);
    toast.success(editingId ? "Updated" : "Added");
    reset();
    qc.invalidateQueries({ queryKey: ["admin-rentals"] });
  };

  const edit = (p: any) => {
    setEditingId(p.id);
    setForm({
      name: p.name, description: p.description || "", vehicle_type: p.vehicle_type || "",
      daily_rate: String(p.daily_rate),
      seats: p.seats ? String(p.seats) : "",
      transmission: p.transmission || "Automatic",
      fuel: p.fuel || "Petrol",
      features: Array.isArray(p.features) ? p.features.join(", ") : "",
      image_url: p.image_url || "",
      images: normalizeImages(p.images, p.image_url),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const remove = async (id: string) => {
    if (!confirm("Delete this rental?")) return;
    await supabase.from("rentals").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin-rentals"] });
  };
  const toggle = async (r: any) => { await supabase.from("rentals").update({ active: !r.active }).eq("id", r.id); qc.invalidateQueries({ queryKey: ["admin-rentals"] }); };

  const filtered = useMemo(() => {
    const list = (items as any[]) || [];
    return list.filter((r: any) => !search || `${r.name} ${r.vehicle_type ?? ""}`.toLowerCase().includes(search.toLowerCase()));
  }, [items, search]);
  const toggleSel = (id: string) => { const n = new Set(selected); n.has(id) ? n.delete(id) : n.add(id); setSelected(n); };
  const clearSel = () => setSelected(new Set());
  const bulk = async (patch: any, msg: string) => {
    if (!selected.size) return;
    const { error } = await supabase.from("rentals").update(patch).in("id", Array.from(selected));
    if (error) return toast.error(error.message);
    toast.success(`${selected.size} ${msg}`); clearSel();
    qc.invalidateQueries({ queryKey: ["admin-rentals"] });
  };
  const bulkDelete = async () => {
    if (!selected.size || !confirm(`Delete ${selected.size} rentals?`)) return;
    const { error } = await supabase.from("rentals").delete().in("id", Array.from(selected));
    if (error) return toast.error(error.message);
    toast.success(`${selected.size} deleted`); clearSel();
    qc.invalidateQueries({ queryKey: ["admin-rentals"] });
  };

  return (
    <>
      <h1>Rental Vehicles</h1>
      <div className="ga-admin-form">
        <h3>{editingId ? "Edit rental" : "Add rental"}</h3>
        <div className="ga-form-grid">
          <label>Name<input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></label>
          <label>Vehicle type<input value={form.vehicle_type} onChange={e => setForm({ ...form, vehicle_type: e.target.value })} /></label>
          <label>Daily rate (GHS)<input type="number" step="0.01" value={form.daily_rate} onChange={e => setForm({ ...form, daily_rate: e.target.value })} /></label>
          <label>Seats<input type="number" value={form.seats} onChange={e => setForm({ ...form, seats: e.target.value })} /></label>
          <label>Transmission
            <select value={form.transmission} onChange={e => setForm({ ...form, transmission: e.target.value })}>
              <option>Automatic</option><option>Manual</option><option>CVT</option>
            </select>
          </label>
          <label>Fuel
            <select value={form.fuel} onChange={e => setForm({ ...form, fuel: e.target.value })}>
              <option>Petrol</option><option>Diesel</option><option>Electric</option><option>Hybrid</option>
            </select>
          </label>
          <label className="ga-form-full">Description<textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></label>
          <label className="ga-form-full">Features (comma separated)<input value={form.features} onChange={e => setForm({ ...form, features: e.target.value })} placeholder="Bluetooth, Reverse camera, Cruise control" /></label>
          <div className="ga-form-full">
            <label>Images (up to 20, first is primary, add captions per image)</label>
            <ImageGalleryEditor
              images={form.images}
              primaryUrl={form.image_url}
              onChange={(images, primary) => setForm(f => ({ ...f, images, image_url: primary }))}
              bucketPrefix="rent"
            />
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="ga-btn-primary" onClick={save} disabled={!form.name || !form.daily_rate}>{editingId ? "Update" : "Add rental"}</button>
          {editingId && <button className="ga-btn-ghost" onClick={reset}>Cancel</button>}
        </div>
      </div>

      <div className="ga-admin-form" style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
        <input placeholder="Search rentals…" value={search} onChange={e => setSearch(e.target.value)} style={{ flex: "1 1 200px" }} />
        <span className="ga-admin-mini">{filtered.length} of {items?.length ?? 0}</span>
      </div>
      {selected.size > 0 && (
        <div className="ga-admin-form" style={{ display: "flex", gap: 8, background: "#fff8e1" }}>
          <strong>{selected.size} selected</strong>
          <button onClick={() => bulk({ active: true }, "activated")}>Activate</button>
          <button onClick={() => bulk({ active: false }, "deactivated")}>Deactivate</button>
          <button className="ga-danger" onClick={bulkDelete}>Delete</button>
          <button className="ga-btn-ghost" onClick={clearSel}>Clear</button>
        </div>
      )}

      <div className="ga-admin-list">
        {filtered.map((p: any) => (
          <div key={p.id} className="ga-admin-row">
            <input type="checkbox" checked={selected.has(p.id)} onChange={() => toggleSel(p.id)} />
            <img src={p.image_url || "/favicon.ico"} alt="" />
            <div><strong>{p.name}</strong><span className="ga-muted">{p.vehicle_type} {!p.active && "· inactive"}</span></div>
            <div className="ga-admin-price">GHS {Number(p.daily_rate).toFixed(2)} / day</div>
            <div className="ga-admin-actions">
              <button onClick={() => edit(p)}>Edit</button>
              <button onClick={() => toggle(p)}>{p.active ? "Hide" : "Show"}</button>
              <button onClick={() => remove(p.id)} className="ga-danger">Delete</button>
            </div>
          </div>
        ))}
        {!filtered.length && <p className="ga-admin-empty">No rentals match your search.</p>}
      </div>
    </>
  );
}