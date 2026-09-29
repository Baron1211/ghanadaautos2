import {
  CalendarDays, Gauge, Fuel, Cog, ShoppingCart, Users, Car, KeyRound, Wrench, Ship, Package,
  MapPin, MessageCircle, Clock, ClipboardList, Palette, Armchair, CircleDot, Truck, Lock,
  CheckCircle2, Tag, Receipt, Bell, ShieldCheck, Pencil, AlertTriangle, Menu, Check, Heart,
  type LucideIcon,
} from "lucide-react";

const MAP: Record<string, LucideIcon> = {
  "📅": CalendarDays, "🛣": Gauge, "⛽": Fuel, "⚙": Cog, "🛒": ShoppingCart, "👤": Users, "👥": Users,
  "🚗": Car, "🚙": Car, "🔑": KeyRound, "🛠": Wrench, "🔧": Wrench, "🚢": Ship, "📦": Package,
  "📍": MapPin, "💬": MessageCircle, "🕒": Clock, "📋": ClipboardList, "🎨": Palette, "🪑": Armchair,
  "🛞": CircleDot, "🚚": Truck, "🔒": Lock, "✅": CheckCircle2, "🏷": Tag, "🧾": Receipt, "🔔": Bell,
  "🛡": ShieldCheck, "✎": Pencil, "⚠": AlertTriangle, "☰": Menu, "✓": Check, "♡": Heart,
};

/** Renders a clean line icon in place of an emoji character. Unknown characters render as-is. */
export default function EmojiIcon({ e, className = "" }: { e: string; className?: string }) {
  const key = String(e).replace(/[\uFE0E\uFE0F]/g, "");
  const Icon = MAP[key];
  if (!Icon) return <>{e}</>;
  return <Icon className={`ico ${className}`.trim()} strokeWidth={1.9} aria-hidden="true" />;
}
