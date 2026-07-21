import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminOverview,
});

function AdminOverview() {
  const { data } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [parts, rentals, orders, users] = await Promise.all([
        supabase.from("parts").select("id", { count: "exact", head: true }),
        supabase.from("rentals").select("id", { count: "exact", head: true }),
        supabase.from("orders").select("total"),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
      ]);
      const revenue = (orders.data || []).reduce((s, o: any) => s + Number(o.total), 0);
      return {
        parts: parts.count || 0,
        rentals: rentals.count || 0,
        orderCount: orders.data?.length || 0,
        revenue,
        users: users.count || 0,
      };
    },
  });

  return (
    <>
      <h1>Admin Overview</h1>
      <div className="ga-stats">
        <div className="ga-stat"><span>Parts</span><strong>{data?.parts ?? "—"}</strong></div>
        <div className="ga-stat"><span>Rentals</span><strong>{data?.rentals ?? "—"}</strong></div>
        <div className="ga-stat"><span>Orders</span><strong>{data?.orderCount ?? "—"}</strong></div>
        <div className="ga-stat"><span>Users</span><strong>{data?.users ?? "—"}</strong></div>
        <div className="ga-stat"><span>Revenue</span><strong>CAD {data?.revenue.toFixed(2) ?? "—"}</strong></div>
      </div>
    </>
  );
}