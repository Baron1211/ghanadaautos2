import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const input = z.object({
  email: z.string().trim().toLowerCase().email().max(255),
  password: z.string().min(8, "Password must be at least 8 characters").max(72),
  fullName: z.string().trim().max(120).optional(),
});

/**
 * Super admins only: create a login (email + password) and grant it super-admin access.
 * If the email already has an account, the existing account is upgraded instead.
 */
export const createSuperAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => input.parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: caller } = await supabase
      .from("user_roles")
      .select("is_super_admin")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();
    if (!caller?.is_super_admin) {
      throw new Error("Only a super admin can add another super admin.");
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    let targetId: string | null = null;
    let created = false;
    const { data: made, error: createErr } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: data.fullName ? { full_name: data.fullName } : undefined,
    });
    if (made?.user) {
      targetId = made.user.id;
      created = true;
    } else {
      // Account may already exist: find it and upgrade it (password left unchanged).
      for (let page = 1; page <= 20 && !targetId; page++) {
        const { data: list, error: listErr } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 200 });
        if (listErr) throw new Error(listErr.message);
        targetId = list.users.find((u) => (u.email || "").toLowerCase() === data.email)?.id ?? null;
        if (list.users.length < 200) break;
      }
      if (!targetId) throw new Error(createErr?.message || "Could not create the account.");
    }

    await supabaseAdmin.from("user_roles").delete().eq("user_id", targetId).eq("role", "admin");
    const { error: roleErr } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: targetId, role: "admin", is_super_admin: true });
    if (roleErr) throw new Error(roleErr.message);

    return { created, email: data.email };
  });
