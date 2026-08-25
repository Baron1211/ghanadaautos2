import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ADMIN_SECTIONS, useAdminAccess } from "@/lib/admin-perms";

export const Route = createFileRoute("/_authenticated/admin/staff")({
  component: AdminStaff,
});

function AdminStaff() {
  const qc = useQueryClient();
  const access = useAdminAccess();

  const { data: staff } = useQuery({
    queryKey: ["admin-staff"],
    queryFn: async () => {
      const { data: roles, error } = await supabase.from("user_roles").select("user_id, role, is_super_admin").eq("role", "admin");
      if (error) throw error;
      const ids = (roles || []).map((r: any) => r.user_id);
      const { data: profiles } = ids.length
        ? await supabase.from("profiles").select("id, full_name, phone, avatar_url").in("id", ids)
        : { data: [] as any[] };
      const { data: perms } = ids.length
        ? await supabase.from("admin_permissions").select("user_id, section").in("user_id", ids)
        : { data: [] as any[] };
      return (roles || []).map((r: any) => ({
        user_id: r.user_id,
        is_super_admin: r.is_super_admin,
        profile: (profiles || []).find((p: any) => p.id === r.user_id),
        sections: (perms || []).filter((p: any) => p.user_id === r.user_id).map((p: any) => p.section),
      }));
    },
  });

  const { data: customers } = useQuery({
    queryKey: ["admin-nonstaff"],
    queryFn: async () => {
      const { data: roles } = await supabase.from("user_roles").select("user_id").eq("role", "admin");
      const adminIds = new Set((roles || []).map((r: any) => r.user_id));
      const { data } = await supabase.from("profiles").select("id, full_name, phone").order("created_at", { ascending: false });
      return (data || []).filter((p: any) => !adminIds.has(p.id));
    },
  });

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["admin-staff"] });
    qc.invalidateQueries({ queryKey: ["admin-nonstaff"] });
  };

  const addStaff = async (userId: string) => {
    const { error } = await supabase.from("user_roles").insert({ user_id: userId, role: "admin" });
    if (error) return toast.error(error.message);
    toast.success("Staff admin added — now grant section access");
    refresh();
  };

  const removeStaff = async (userId: string) => {
    if (!confirm("Remove admin access for this user?")) return;
    await supabase.from("admin_permissions").delete().eq("user_id", userId);
    const { error } = await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", "admin");
    if (error) return toast.error(error.message);
    toast.success("Admin access removed");
    refresh();
  };

  const toggleSuper = async (userId: string, next: boolean) => {
    const { error } = await supabase.from("user_roles").update({ is_super_admin: next }).eq("user_id", userId).eq("role", "admin");
    if (error) return toast.error(error.message);
    toast.success(next ? "Now a super admin" : "Super admin removed");
    refresh();
  };

  const toggleSection = async (userId: string, section: string, has: boolean) => {
    if (has) {
      const { error } = await supabase.from("admin_permissions").delete().eq("user_id", userId).eq("section", section);
      if (error) return toast.error(error.message);
    } else {
      const { error } = await supabase.from("admin_permissions").insert({ user_id: userId, section });
      if (error) return toast.error(error.message);
    }
    refresh();
  };

  if (access.status === "ok" && !access.isSuperAdmin) {
    return (
      <>
        <h1>Staff &amp; Permissions</h1>
        <p className="ga-muted">Only a super admin can onboard staff and change permissions.</p>
      </>
    );
  }

  return (
    <>
      <h1>Staff &amp; Permissions</h1>
      <p className="ga-muted">Super admins see everything. For staff admins, tick only the sections they should access.</p>

      <div className="ga-admin-list">
        {(staff || []).map((s: any) => (
          <div key={s.user_id} className="ga-staff-card">
            <div className="ga-staff-head">
              <div className="ga-avatar-sm" style={{ backgroundImage: s.profile?.avatar_url ? `url(${s.profile.avatar_url})` : undefined }}>
                {!s.profile?.avatar_url && <span>{(s.profile?.full_name || "?").charAt(0).toUpperCase()}</span>}
              </div>
              <div>
                <strong>{s.profile?.full_name || s.user_id.slice(0, 8)}</strong>
                <span className="ga-muted">{s.profile?.phone || "—"}{s.is_super_admin ? " · Super admin" : ""}</span>
              </div>
              <div className="ga-admin-actions">
                <button className={s.is_super_admin ? "" : "ga-btn-primary"} onClick={() => toggleSuper(s.user_id, !s.is_super_admin)}>
                  {s.is_super_admin ? "Make staff admin" : "Make super admin"}
                </button>
                <button className="ga-danger" onClick={() => removeStaff(s.user_id)}>Remove admin</button>
              </div>
            </div>
            {!s.is_super_admin && (
              <div className="ga-perm-grid">
                {ADMIN_SECTIONS.map((sec) => {
                  const has = s.sections.includes(sec.key);
                  return (
                    <label key={sec.key} className={`ga-perm${has ? " is-on" : ""}`}>
                      <input type="checkbox" checked={has} onChange={() => toggleSection(s.user_id, sec.key, has)} />
                      {sec.label}
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="ga-admin-form">
        <h3>Onboard a new admin</h3>
        <p className="ga-muted ga-small">The person must already have a customer account on the website.</p>
        <div className="ga-admin-list">
          {(customers || []).slice(0, 50).map((c: any) => (
            <div key={c.id} className="ga-admin-row">
              <div />
              <div>
                <strong>{c.full_name || c.id.slice(0, 8)}</strong>
                <span className="ga-muted">{c.phone || "—"}</span>
              </div>
              <div />
              <div className="ga-admin-actions">
                <button className="ga-btn-primary" onClick={() => addStaff(c.id)}>Make admin</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
