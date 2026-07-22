import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/catalog")({
  component: AdminCatalog,
});

const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function AdminCatalog() {
  return (
    <div className="ga-admin-page">
      <div className="ga-admin-page-head">
        <div>
          <h1>Catalog Setup</h1>
          <p className="ga-admin-sub">Manage the categories and brands used across all products.</p>
        </div>
      </div>
      <div className="ga-admin-grid-2">
        <CategoriesPanel />
        <BrandsPanel />
      </div>
    </div>
  );
}

function CategoriesPanel() {
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const { data } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: async () => {
      const { data, error } = await (supabase as any).from("categories").select("*").order("sort_order").order("name");
      if (error) throw error;
      return data || [];
    },
  });
  const add = async () => {
    if (!name.trim()) return toast.error("Name required");
    const { error } = await (supabase as any).from("categories").insert({ name: name.trim(), slug: slugify(name), description: desc || null });
    if (error) return toast.error(error.message);
    setName(""); setDesc("");
    toast.success("Category added");
    qc.invalidateQueries({ queryKey: ["admin-categories"] });
  };
  const update = async (id: string, patch: any) => {
    const { error } = await (supabase as any).from("categories").update(patch).eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["admin-categories"] });
  };
  const remove = async (id: string) => {
    if (!confirm("Delete this category? Products in it will become uncategorised.")) return;
    const { error } = await (supabase as any).from("categories").delete().eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["admin-categories"] });
  };

  return (
    <section className="ga-admin-card">
      <div className="ga-admin-card-head"><h3>Categories</h3></div>
      <div className="ga-form-grid">
        <label>Name<input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Brake System" /></label>
        <label>Description<input value={desc} onChange={e => setDesc(e.target.value)} placeholder="Optional" /></label>
      </div>
      <button className="ga-btn-primary" onClick={add} style={{ marginTop: 8 }}>+ Add category</button>

      <table className="ga-admin-table" style={{ marginTop: 16 }}>
        <thead><tr><th>Name</th><th>Slug</th><th>Sort</th><th>Active</th><th></th></tr></thead>
        <tbody>
          {(data || []).map((c: any) => (
            <tr key={c.id}>
              <td><input defaultValue={c.name} onBlur={e => e.target.value !== c.name && update(c.id, { name: e.target.value, slug: slugify(e.target.value) })} /></td>
              <td><code className="ga-admin-mini">{c.slug}</code></td>
              <td style={{ width: 70 }}><input type="number" defaultValue={c.sort_order} onBlur={e => update(c.id, { sort_order: Number(e.target.value) })} /></td>
              <td><input type="checkbox" defaultChecked={c.active} onChange={e => update(c.id, { active: e.target.checked })} /></td>
              <td><button className="ga-danger" onClick={() => remove(c.id)}>×</button></td>
            </tr>
          ))}
          {!data?.length && <tr><td colSpan={5}><p className="ga-admin-empty">No categories yet.</p></td></tr>}
        </tbody>
      </table>
    </section>
  );
}

function BrandsPanel() {
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const { data } = useQuery({
    queryKey: ["admin-brands"],
    queryFn: async () => {
      const { data, error } = await (supabase as any).from("brands").select("*").order("name");
      if (error) throw error;
      return data || [];
    },
  });
  const add = async () => {
    if (!name.trim()) return toast.error("Name required");
    const { error } = await (supabase as any).from("brands").insert({ name: name.trim(), slug: slugify(name) });
    if (error) return toast.error(error.message);
    setName("");
    toast.success("Brand added");
    qc.invalidateQueries({ queryKey: ["admin-brands"] });
  };
  const update = async (id: string, patch: any) => {
    const { error } = await (supabase as any).from("brands").update(patch).eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["admin-brands"] });
  };
  const remove = async (id: string) => {
    if (!confirm("Delete this brand?")) return;
    const { error } = await (supabase as any).from("brands").delete().eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["admin-brands"] });
  };

  return (
    <section className="ga-admin-card">
      <div className="ga-admin-card-head"><h3>Brands</h3></div>
      <div style={{ display: "flex", gap: 8 }}>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Toyota" style={{ flex: 1 }} />
        <button className="ga-btn-primary" onClick={add}>+ Add</button>
      </div>

      <table className="ga-admin-table" style={{ marginTop: 16 }}>
        <thead><tr><th>Name</th><th>Slug</th><th>Active</th><th></th></tr></thead>
        <tbody>
          {(data || []).map((b: any) => (
            <tr key={b.id}>
              <td><input defaultValue={b.name} onBlur={e => e.target.value !== b.name && update(b.id, { name: e.target.value, slug: slugify(e.target.value) })} /></td>
              <td><code className="ga-admin-mini">{b.slug}</code></td>
              <td><input type="checkbox" defaultChecked={b.active} onChange={e => update(b.id, { active: e.target.checked })} /></td>
              <td><button className="ga-danger" onClick={() => remove(b.id)}>×</button></td>
            </tr>
          ))}
          {!data?.length && <tr><td colSpan={4}><p className="ga-admin-empty">No brands yet.</p></td></tr>}
        </tbody>
      </table>
    </section>
  );
}