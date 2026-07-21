import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/users")({
  component: AdminUsers,
});

function AdminUsers() {
  const qc = useQueryClient();
  const { data: users } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data: profiles, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      const { data: roles } = await supabase.from("user_roles").select("user_id, role");
      return profiles.map((p: any) => ({
        ...p,
        isAdmin: !!roles?.find((r: any) => r.user_id === p.id && r.role === "admin"),
      }));
    },
  });

  const toggleAdmin = async (userId: string, isAdmin: boolean) => {
    if (isAdmin) {
      const { error } = await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", "admin");
      if (error) return toast.error(error.message);
      toast.success("Admin removed");
    } else {
      const { error } = await supabase.from("user_roles").insert({ user_id: userId, role: "admin" });
      if (error) return toast.error(error.message);
      toast.success("Promoted to admin");
    }
    qc.invalidateQueries({ queryKey: ["admin-users"] });
  };

  return (
    <>
      <h1>Users</h1>
      <div className="ga-admin-list">
        {users?.map((u: any) => (
          <div key={u.id} className="ga-admin-row">
            <div className="ga-avatar-sm" style={{ backgroundImage: u.avatar_url ? `url(${u.avatar_url})` : undefined }}>
              {!u.avatar_url && <span>{(u.full_name || "?").charAt(0).toUpperCase()}</span>}
            </div>
            <div>
              <strong>{u.full_name || "Unnamed"}</strong>
              <span className="ga-muted">{u.phone || "—"}{u.isAdmin ? " · Admin" : ""}</span>
            </div>
            <div />
            <div className="ga-admin-actions">
              <button className={u.isAdmin ? "ga-danger" : "ga-btn-primary"} onClick={() => toggleAdmin(u.id, u.isAdmin)}>
                {u.isAdmin ? "Revoke admin" : "Make admin"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}