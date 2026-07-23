import { supabase } from "@/integrations/supabase/client";

export type CartItemPayload = {
  item_type: "part" | "rental" | "vehicle";
  part_id?: string | null;
  variation_id?: string | null;
  rental_id?: string | null;
  vehicle_id?: string | null;
  quantity?: number;
  rental_days?: number | null;
  rental_start?: string | null;
  // Guest-only display fields
  name?: string;
  unit_price?: number;
  image_url?: string | null;
};

const GUEST_KEY = "guest_cart";

export function readGuestCart(): CartItemPayload[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(GUEST_KEY) || "[]");
  } catch {
    return [];
  }
}

function writeGuestCart(items: CartItemPayload[]) {
  localStorage.setItem(GUEST_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("cart:changed"));
}

export async function addToCart(item: CartItemPayload): Promise<void> {
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) {
    const cart = readGuestCart();
    cart.push({ ...item, quantity: item.quantity || 1 });
    writeGuestCart(cart);
    return;
  }
  const row: any = {
    user_id: u.user.id,
    item_type: item.item_type,
    quantity: item.quantity || 1,
    part_id: item.part_id || null,
    variation_id: item.variation_id || null,
    rental_id: item.rental_id || null,
    vehicle_id: item.vehicle_id || null,
    rental_days: item.rental_days || null,
    rental_start: item.rental_start || null,
  };
  const { error } = await (supabase as any).from("cart_items").insert(row);
  if (error) throw error;
  window.dispatchEvent(new Event("cart:changed"));
}

export async function getCartCount(): Promise<number> {
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) return readGuestCart().length;
  const { count } = await (supabase as any)
    .from("cart_items")
    .select("id", { count: "exact", head: true })
    .eq("user_id", u.user.id);
  return count || 0;
}