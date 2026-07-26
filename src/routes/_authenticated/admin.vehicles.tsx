import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ImageGalleryEditor } from "@/components/admin/ImageGalleryEditor";
import { GalleryImage, normalizeImages, serializeImages } from "@/lib/images";

export const Route = createFileRoute("/_authenticated/admin/vehicles")({
  component: AdminVehicles,
});

const BODY_TYPES = ["SUV", "Sedan", "Luxury", "Pickup", "Electric", "Commercial"];

function AdminVehicles() {
  const qc = useQueryClient();
  const empty = {
    name: "", brand: "", model: "", year: "", body_type: "SUV",
    price: "", mileage_km: "", fuel: "Petrol", transmission: "Automatic", condition: "used",
    seats: "", color: "", description: "", image_url: "", images: [] as GalleryImage[],
    features: "", finance_available: false, featured: false,
  };
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterBody, setFilterBody] = useState("");

  const { data: items } = useQuery({
    queryKey: ["admin-vehicles"],
    queryFn: async () => {
      const { data, error } = await (supabase as any).from("vehicles").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const reset = () => { setForm(empty); setEditingId(null); };

  const save = async () => {
    const payload: any = {
      name: form.name, brand: form.brand, model: form.model,
      year: form.year ? Number(form.year) : null,
      body_type: form.body_type,
      price: Number(form.price),
      mileage_km: form.mileage_km ? Number(form.mileage_km) : 0,
      fuel: form.fuel, transmission: form.transmission,
      condition: form.condition,
      seats: form.seats ? Number(form.seats) : null,
      color: form.color, description: form.description,
      image_url: form.image_url, images: serializeImages(form.images),
      features: form.features ? form.features.split(",").map(s => s.trim()).filter(Boolean) : [],
      finance_available: form.finance_available, featured: form.featured,
    };
    const res = editingId
      ? await (supabase as any).from("vehicles").update(payload).eq("id", editingId)
      : await (supabase as any).from("vehicles").insert(payload);
    if (res.error) return toast.error(res.error.message);
    toast.success(editingId ? "Vehicle updated" : "Vehicle added");
    reset();
    qc.invalidateQueries({ queryKey: ["admin-vehicles"] });
  };

  const edit = (p: any) => {
    setEditingId(p.id);
    setForm({
      name: p.name || "", brand: p.brand || "", model: p.model || "",
      year: p.year ? String(p.year) : "", body_type: p.body_type || "SUV",
      price: String(p.price ?? ""), mileage_km: p.mileage_km ? String(p.mileage_km) : "",
      fuel: p.fuel || "Petrol", transmission: p.transmission || "Automatic",
      condition: p.condition || "used",
      seats: p.seats ? String(p.seats) : "", color: p.color || "",
      description: p.description || "", image_url: p.image_url || "",
      images: normalizeImages(p.images, p.image_url),
      features: Array.isArray(p.features) ? p.features.join(", ") : "",
      finance_available: !!p.finance_available, featured: !!p.featured,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const remove = async (id: string) => {
    if (!confirm("Delete this vehicle?")) return;
    await (supabase as any).from("vehicles").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin-vehicles"] });
  };
  const toggle = async (r: any) => {
    await (supabase as any).from("vehicles").update({ active: !r.active }).eq("id", r.id);
    qc.invalidateQueries({ queryKey: ["admin-vehicles"] });
  };

  const filtered = useMemo(() => {
    const list = (items as any[]) || [];
    return list.filter((r: any) => {
      if (search && !`${r.name} ${r.brand ?? ""} ${r.model ?? ""}`.toLowerCase().includes(search.toLowerCase())) return false;
      if (filterBody && r.body_type !== filterBody) return false;
      return true;
    });
  }, [items, search, filterBody]);

  return (
    <>
      <h1>Vehicles for Sale</h1>
      <div className="ga-admin-form">
        <h3>{editingId ? "Edit vehicle" : "Add vehicle"}</h3>
        <div className="ga-form-grid">
          <label>Name<input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Toyota Highlander XLE" /></label>
          <label>Brand<input value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })} /></label>
          <label>Model<input value={form.model} onChange={e => setForm({ ...form, model: e.target.value })} /></label>
          <label>Year<input type="number" value={form.year} onChange={e => setForm({ ...form, year: e.target.value })} /></label>
          <label>Body type
            <select value={form.body_type} onChange={e => setForm({ ...form, body_type: e.target.value })}>
              {BODY_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </label>
          <label>Condition
            <select value={form.condition} onChange={e => setForm({ ...form, condition: e.target.value })}>
              <option value="new">New</option>
              <option value="used">Used</option>
            </select>
          </label>
          <label>Price (GHS)<input type="number" step="0.01" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} /></label>
          <label>Mileage (km)<input type="number" value={form.mileage_km} onChange={e => setForm({ ...form, mileage_km: e.target.value })} /></label>
          <label>Fuel
            <select value={form.fuel} onChange={e => setForm({ ...form, fuel: e.target.value })}>
              <option>Petrol</option><option>Diesel</option><option>Electric</option><option>Hybrid</option>
            </select>
          </label>
          <label>Transmission
            <select value={form.transmission} onChange={e => setForm({ ...form, transmission: e.target.value })}>
              <option>Automatic</option><option>Manual</option><option>CVT</option>
            </select>
          </label>
          <label>Seats<input type="number" value={form.seats} onChange={e => setForm({ ...form, seats: e.target.value })} /></label>
          <label>Colour<input value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} /></label>
          <label className="ga-form-full">Description<textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></label>
          <label className="ga-form-full">Features (comma separated)<input value={form.features} onChange={e => setForm({ ...form, features: e.target.value })} placeholder="Leather seats, Sunroof, 360° camera" /></label>
          <label><input type="checkbox" checked={form.finance_available} onChange={e => setForm({ ...form, finance_available: e.target.checked })} /> Finance available</label>
          <label><input type="checkbox" checked={form.featured} onChange={e => setForm({ ...form, featured: e.target.checked })} /> Featured</label>
          <div className="ga-form-full">
            <label>Images (up to 20, first is primary, add captions per image)</label>
            <ImageGalleryEditor
              images={form.images}
              primaryUrl={form.image_url}
              onChange={(images, primary) => setForm(f => ({ ...f, images, image_url: primary }))}
              bucketPrefix="veh"
            />
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="ga-btn-primary" onClick={save} disabled={!form.name || !form.price}>{editingId ? "Update" : "Add vehicle"}</button>
          {editingId && <button className="ga-btn-ghost" onClick={reset}>Cancel</button>}
        </div>
      </div>

      <div className="ga-admin-form" style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
        <input placeholder="Search vehicles…" value={search} onChange={e => setSearch(e.target.value)} style={{ flex: "1 1 200px" }} />
        <select value={filterBody} onChange={e => setFilterBody(e.target.value)}>
          <option value="">All body types</option>
          {BODY_TYPES.map(t => <option key={t}>{t}</option>)}
        </select>
        <span className="ga-admin-mini">{filtered.length} of {items?.length ?? 0}</span>
      </div>

      <div className="ga-admin-list">
        {filtered.map((p: any) => (
          <div key={p.id} className="ga-admin-row">
            <img src={p.image_url || "/favicon.ico"} alt="" />
            <div>
              <strong>{p.name}</strong>
              <span className="ga-muted">{p.body_type} · {p.year || "—"} · {p.fuel} {!p.active && "· inactive"}</span>
            </div>
            <div className="ga-admin-price">GHS {Number(p.price).toLocaleString()}</div>
            <div className="ga-admin-actions">
              <button onClick={() => edit(p)}>Edit</button>
              <button onClick={() => toggle(p)}>{p.active ? "Hide" : "Show"}</button>
              <button onClick={() => remove(p.id)} className="ga-danger">Delete</button>
            </div>
          </div>
        ))}
        {!filtered.length && <p className="ga-admin-empty">No vehicles match your filters.</p>}
      </div>
    </>
  );
}