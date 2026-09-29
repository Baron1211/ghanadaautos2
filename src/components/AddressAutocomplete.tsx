import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { MapPin, Loader2 } from "lucide-react";
import { suggestAddresses, type AddressSuggestion } from "@/lib/delivery.functions";

type Props = {
  value: string;
  onChange: (text: string) => void;
  onSelect: (s: AddressSuggestion, sessionToken: string) => void;
  placeholder?: string;
};

const newToken = () => (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : String(Math.random()).slice(2));

export function AddressAutocomplete({ value, onChange, onSelect, placeholder }: Props) {
  const suggest = useServerFn(suggestAddresses);
  const [items, setItems] = useState<AddressSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(-1);
  const [failed, setFailed] = useState(false);
  const token = useRef(newToken());
  const wrap = useRef<HTMLDivElement>(null);
  const skip = useRef(false);

  useEffect(() => {
    if (skip.current) { skip.current = false; return; }
    const q = value.trim();
    if (q.length < 3) { setItems([]); setOpen(false); return; }
    setLoading(true);
    const id = setTimeout(async () => {
      try {
        const res = await suggest({ data: { input: q, sessionToken: token.current } });
        setItems(res); setActive(-1); setOpen(true); setFailed(false);
      } catch {
        setItems([]); setFailed(true); setOpen(true);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(id);
  }, [value, suggest]);

  useEffect(() => {
    const close = (e: MouseEvent) => { if (!wrap.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const pick = (s: AddressSuggestion) => {
    skip.current = true;
    onChange(s.text);
    setOpen(false);
    onSelect(s, token.current);
    token.current = newToken(); // a session ends once a place is chosen
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (!open || !items.length) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => (a + 1) % items.length); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => (a <= 0 ? items.length - 1 : a - 1)); }
    else if (e.key === "Enter" && active >= 0) { e.preventDefault(); pick(items[active]); }
    else if (e.key === "Escape") setOpen(false);
  };

  return (
    <div className="ga-addr" ref={wrap}>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => items.length && setOpen(true)}
        onKeyDown={onKey}
        placeholder={placeholder || "Start typing your address, e.g. East Legon"}
        autoComplete="off"
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
      />
      {loading && <Loader2 size={16} className="ga-addr-spin" aria-hidden />}
      {open && (items.length > 0 || failed) && (
        <ul className="ga-addr-list" role="listbox">
          {items.map((s, i) => (
            <li
              key={s.placeId}
              role="option"
              aria-selected={i === active}
              className={i === active ? "active" : ""}
              onMouseDown={(e) => { e.preventDefault(); pick(s); }}
              onMouseEnter={() => setActive(i)}
            >
              <MapPin size={16} aria-hidden />
              <span><strong>{s.main}</strong><small>{s.secondary}</small></span>
            </li>
          ))}
          {failed && <li className="ga-addr-empty">Couldn't load suggestions — you can type your full address instead.</li>}
        </ul>
      )}
    </div>
  );
}
