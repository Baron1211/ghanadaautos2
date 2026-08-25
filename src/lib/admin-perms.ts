import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const ADMIN_SECTIONS: { key: string; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "vehicles", label: "Vehicles for Sale" },
  { key: "parts", label: "Spare Parts" },
  { key: "rentals", label: "Rental Fleet" },
  { key: "catalog", label: "Catalog Setup" },
  { key: "orders", label: "Orders" },
  { key: "bookings", label: "Rental Bookings" },
  { key: "repairs", label: "Repair Requests" },
  { key: "shipments", label: "Tracking & Shipments" },
  { key: "notifications", label: "Notifications & Announcements" },
  { key: "content", label: "Website Content (CMS)" },
  { key: "users", label: "Customers" },
  { key: "staff", label: "Staff & Permissions" },
  { key: "settings", label: "Site Settings" },
];

export type AdminAccess = {
  status: "checking" | "ok" | "denied";
  isSuperAdmin: boolean;
  sections: string[];
  email: string;
  can: (section: string) => boolean;
};

export function useAdminAccess(): AdminAccess {
  const [status, setStatus] = useState<AdminAccess["status"]>("checking");
  const [isSuperAdmin, setSuper] = useState(false);
  const [sections, setSections] = useState<string[]>([]);
  const [email, setEmail] = useState("");

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) { setStatus("denied"); return; }
      setEmail(u.user.email || "");
      const { data: role } = await supabase
        .from("user_roles").select("role, is_super_admin")
        .eq("user_id", u.user.id).eq("role", "admin").maybeSingle();
      if (!role) { setStatus("denied"); return; }
      const sup = !!(role as any).is_super_admin;
      setSuper(sup);
      if (sup) {
        setSections(ADMIN_SECTIONS.map((s) => s.key));
      } else {
        const { data: perms } = await supabase
          .from("admin_permissions").select("section").eq("user_id", u.user.id);
        setSections((perms || []).map((p: any) => p.section));
      }
      setStatus("ok");
    })();
  }, []);

  return {
    status, isSuperAdmin, sections, email,
    can: (section: string) => isSuperAdmin || sections.includes(section),
  };
}
