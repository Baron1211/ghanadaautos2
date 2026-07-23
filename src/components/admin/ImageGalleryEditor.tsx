import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { GalleryImage, MAX_IMAGES } from "@/lib/images";

type Props = {
  images: GalleryImage[];
  primaryUrl: string;
  onChange: (images: GalleryImage[], primaryUrl: string) => void;
  bucketPrefix?: string;
};

export function ImageGalleryEditor({ images, primaryUrl, onChange, bucketPrefix = "img" }: Props) {
  const [busy, setBusy] = useState(false);

  const uploadOne = async (file: File): Promise<string | null> => {
    const path = `${bucketPrefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}-${file.name}`;
    const { error } = await supabase.storage.from("product-images").upload(path, file);
    if (error) { toast.error(error.message); return null; }
    const { data } = await supabase.storage.from("product-images").createSignedUrl(path, 60 * 60 * 24 * 365);
    return data?.signedUrl || null;
  };

  const addFiles = async (files: FileList) => {
    const remaining = MAX_IMAGES - images.length;
    if (remaining <= 0) { toast.error(`Maximum ${MAX_IMAGES} images.`); return; }
    const list = Array.from(files).slice(0, remaining);
    if (files.length > list.length) toast.warning(`Only ${list.length} added (limit ${MAX_IMAGES}).`);
    setBusy(true);
    const next: GalleryImage[] = [...images];
    let newPrimary = primaryUrl;
    for (const f of list) {
      const url = await uploadOne(f);
      if (url) {
        next.push({ url, caption: "" });
        if (!newPrimary) newPrimary = url;
      }
    }
    setBusy(false);
    onChange(next, newPrimary);
  };

  const remove = (url: string) => {
    const next = images.filter((i) => i.url !== url);
    const newPrimary = primaryUrl === url ? (next[0]?.url || "") : primaryUrl;
    onChange(next, newPrimary);
  };

  const setCaption = (url: string, caption: string) => {
    onChange(images.map((i) => i.url === url ? { ...i, caption } : i), primaryUrl);
  };

  const move = (url: string, dir: -1 | 1) => {
    const idx = images.findIndex((i) => i.url === url);
    if (idx < 0) return;
    const to = idx + dir;
    if (to < 0 || to >= images.length) return;
    const next = images.slice();
    [next[idx], next[to]] = [next[to], next[idx]];
    onChange(next, primaryUrl);
  };

  return (
    <div className="ga-gallery-editor">
      <input
        type="file"
        accept="image/*"
        multiple
        disabled={busy || images.length >= MAX_IMAGES}
        onChange={(e) => e.target.files && addFiles(e.target.files)}
      />
      <div className="ga-gallery-meta">
        <small>{images.length} / {MAX_IMAGES} images{busy ? " · uploading…" : ""}. Click a thumbnail to set as primary. Add a short caption to describe each image (e.g. “Front view”, “Interior”, “Odometer”).</small>
      </div>
      {images.length > 0 && (
        <div className="ga-gallery-list">
          {images.map((img) => (
            <div key={img.url} className={`ga-gallery-item ${primaryUrl === img.url ? "primary" : ""}`}>
              <img
                src={img.url}
                alt={img.caption || "product image"}
                onClick={() => onChange(images, img.url)}
                title={primaryUrl === img.url ? "Primary image" : "Click to set as primary"}
              />
              <input
                type="text"
                maxLength={80}
                value={img.caption}
                placeholder="Caption (optional)"
                onChange={(e) => setCaption(img.url, e.target.value)}
              />
              <div className="ga-gallery-actions">
                <button type="button" onClick={() => move(img.url, -1)} title="Move left">←</button>
                <button type="button" onClick={() => move(img.url, 1)} title="Move right">→</button>
                <button type="button" className="ga-danger" onClick={() => remove(img.url)} title="Remove">×</button>
              </div>
              {primaryUrl === img.url && <span className="ga-gallery-badge">Primary</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}