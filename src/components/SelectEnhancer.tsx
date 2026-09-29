import { useEffect } from "react";

/**
 * Upgrades every native <select> on the public site into a custom animated dropdown.
 * The native select stays in the DOM (hidden) and remains the source of truth, so React
 * state, forms and filters keep working unchanged: we set its value and fire a real "change".
 */
const CHEVRON =
  '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';
const CHECK =
  '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>';

const setNativeValue = (sel: HTMLSelectElement, value: string) => {
  const setter = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, "value")?.set;
  setter?.call(sel, value);
  sel.dispatchEvent(new Event("change", { bubbles: true }));
};

const isDark = (rgb: string) => {
  const m = rgb.match(/[\d.]+/g)?.map(Number);
  if (!m || m.length < 3) return false;
  if (m.length >= 4 && m[3] < 0.15) return false;
  return (m[0] * 299 + m[1] * 587 + m[2] * 114) / 1000 < 110;
};

let closeCurrent: (() => void) | null = null;

function enhance(sel: HTMLSelectElement) {
  if (sel.dataset.gaDd || sel.multiple || sel.closest(".ga-admin-shell") || sel.closest("[data-no-dd]")) return;
  // NOTE: the native <select> is never moved or re-classed (React owns it). We only add a
  // sibling button after it and hide the select through a data attribute + CSS.
  const cs = getComputedStyle(sel);

  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "ga-dd-btn";
  btn.setAttribute("aria-haspopup", "listbox");
  btn.setAttribute("aria-expanded", "false");
  if (sel.id) btn.id = `${sel.id}-dd`;
  // inherit the look of the field it replaces (dark or light forms)
  const st = btn.style;
  st.font = cs.font;
  st.color = cs.color;
  st.background = cs.background;
  st.border = cs.border;
  st.borderRadius = cs.borderRadius;
  st.padding = cs.padding;
  st.height = cs.height !== "auto" ? cs.height : "";
  st.minHeight = cs.minHeight;
  st.width = "100%";
  const dark =
    isDark(cs.backgroundColor) || isDark(getComputedStyle(sel.parentElement || document.body).backgroundColor);
  btn.dataset.tone = dark ? "dark" : "light";
  btn.innerHTML = `<span class="ga-dd-label"></span><span class="ga-dd-chev">${CHEVRON}</span>`;
  sel.insertAdjacentElement("afterend", btn);
  sel.dataset.gaDd = "1";
  const label = btn.querySelector(".ga-dd-label") as HTMLElement;

  const sync = () => {
    const o = sel.options[sel.selectedIndex];
    const text = o ? o.text : "";
    if (label.textContent !== text) label.textContent = text;
    label.classList.toggle("is-placeholder", !sel.value);
    btn.disabled = sel.disabled;
  };
  sync();
  sel.addEventListener("change", sync);
  const mo = new MutationObserver(sync);
  mo.observe(sel, { childList: true, subtree: true, attributes: true, characterData: true });
  const timer = window.setInterval(() => {
    if (!sel.isConnected) {
      window.clearInterval(timer);
      mo.disconnect();
      closeCurrent === close && close();
      btn.remove();
      return;
    }
    sync();
  }, 350);

  let panel: HTMLDivElement | null = null;
  let scrim: HTMLDivElement | null = null;
  let active = -1;

  const close = () => {
    if (!panel) return;
    const p = panel;
    const s = scrim;
    panel = null;
    scrim = null;
    p.classList.remove("is-open");
    s?.classList.remove("is-open");
    btn.setAttribute("aria-expanded", "false");
    btn.classList.remove("is-open");
    window.setTimeout(() => {
      p.remove();
      s?.remove();
    }, 200);
    document.removeEventListener("mousedown", onOutside, true);
    document.removeEventListener("keydown", onKey, true);
    window.removeEventListener("resize", onResize);
    window.removeEventListener("scroll", onScroll, true);
    if (closeCurrent === close) closeCurrent = null;
  };
  const onOutside = (e: MouseEvent) => {
    const t = e.target as Node;
    if (panel && !panel.contains(t) && !btn.contains(t)) close();
  };
  let openTop = 0;
  let openW = 0;
  const onResize = () => {
    // ignore height-only changes (mobile address bar); close when the layout width changes
    if (window.innerWidth !== openW) close();
  };
  const onScroll = (e: Event) => {
    if (!panel || panel.contains(e.target as Node)) return;
    // only close if the field actually moved (page scrolled away from it)
    if (Math.abs(btn.getBoundingClientRect().top - openTop) > 4) close();
  };
  const choose = (i: number) => {
    const o = sel.options[i];
    if (o && !o.disabled) {
      setNativeValue(sel, o.value);
      sync();
    }
    close();
    btn.focus();
  };
  const items = () => Array.from(panel?.querySelectorAll<HTMLElement>(".ga-dd-item") ?? []);
  const highlight = (i: number) => {
    const list = items();
    if (!list.length) return;
    active = (i + list.length) % list.length;
    list.forEach((el, k) => el.classList.toggle("is-active", k === active));
    // scroll only inside the panel (never the page)
    const el = list[active];
    if (panel) {
      if (el.offsetTop < panel.scrollTop) panel.scrollTop = el.offsetTop - 6;
      else if (el.offsetTop + el.offsetHeight > panel.scrollTop + panel.clientHeight)
        panel.scrollTop = el.offsetTop + el.offsetHeight - panel.clientHeight + 6;
    }
  };
  const onKey = (e: KeyboardEvent) => {
    if (!panel) return;
    if (e.key === "Escape") {
      e.preventDefault();
      close();
      btn.focus();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      highlight(active + 1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      highlight(active - 1);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (active >= 0) choose(Number(items()[active].dataset.i));
    }
  };

  const open = () => {
    if (sel.disabled) return;
    closeCurrent?.();
    closeCurrent = close;
    const r = btn.getBoundingClientRect();
    openTop = r.top;
    const sheet = window.innerWidth < 640;
    const p = document.createElement("div");
    panel = p;
    p.className = `ga-dd-panel${sheet ? " is-sheet" : ""}`;
    p.dataset.tone = btn.dataset.tone || "light";
    p.setAttribute("role", "listbox");
    Array.from(sel.options).forEach((o, i) => {
      const it = document.createElement("div");
      it.className =
        "ga-dd-item" + (i === sel.selectedIndex ? " is-selected" : "") + (o.disabled ? " is-disabled" : "");
      it.dataset.i = String(i);
      it.setAttribute("role", "option");
      it.style.setProperty("--d", `${Math.min(i, 12) * 22}ms`);
      const text = document.createElement("span");
      text.textContent = o.text;
      const check = document.createElement("i");
      check.className = "ga-dd-check";
      if (i === sel.selectedIndex) check.innerHTML = CHECK;
      it.append(text, check);
      it.addEventListener("mousedown", (e) => e.preventDefault());
      it.addEventListener("click", () => choose(i));
      it.addEventListener("mousemove", () => highlight(i));
      p.appendChild(it);
    });
    if (sheet) {
      scrim = document.createElement("div");
      scrim.className = "ga-dd-scrim";
      scrim.addEventListener("click", close);
      document.body.appendChild(scrim);
      const head = document.createElement("div");
      head.className = "ga-dd-sheet-title";
      const lab = sel.closest("label")?.childNodes[0]?.textContent?.trim();
      head.textContent = lab || "Choose an option";
      p.prepend(head);
    } else {
      const below = window.innerHeight - r.bottom;
      const above = r.top;
      const width = Math.max(r.width, 200);
      const maxH = Math.max(160, Math.min(320, (below >= 220 || below >= above ? below : above) - 16));
      p.style.width = `${width}px`;
      p.style.left = `${Math.max(8, Math.min(r.left, window.innerWidth - width - 8))}px`;
      p.style.maxHeight = `${maxH}px`;
      if (below >= 220 || below >= above) p.style.top = `${r.bottom + 8}px`;
      else {
        p.style.bottom = `${window.innerHeight - r.top + 8}px`;
        p.classList.add("is-up");
      }
    }
    document.body.appendChild(p);
    window.setTimeout(() => {
      p.classList.add("is-open");
      scrim?.classList.add("is-open");
    }, 20);
    btn.setAttribute("aria-expanded", "true");
    btn.classList.add("is-open");
    highlight(sel.selectedIndex);
    document.addEventListener("mousedown", onOutside, true);
    document.addEventListener("keydown", onKey, true);
    openW = window.innerWidth;
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onScroll, true);
  };

  btn.addEventListener("click", () => (panel ? close() : open()));
  btn.addEventListener("keydown", (e) => {
    if (!panel && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      e.preventDefault();
      open();
    }
  });
}

export default function SelectEnhancer() {
  useEffect(() => {
    // Wait until React has finished hydrating the page; touching the DOM earlier would
    // cause hydration mismatches.
    let mo: MutationObserver | undefined;
    let pending = 0;
    const run = () => document.querySelectorAll<HTMLSelectElement>("select:not([data-ga-dd])").forEach(enhance);
    const start = () => {
      run();
      mo = new MutationObserver(() => {
        window.clearTimeout(pending);
        pending = window.setTimeout(run, 60);
      });
      mo.observe(document.body, { childList: true, subtree: true });
    };
    const t = window.setTimeout(start, document.readyState === "complete" ? 1400 : 2200);
    return () => {
      window.clearTimeout(t);
      window.clearTimeout(pending);
      mo?.disconnect();
    };
  }, []);
  return null;
}
