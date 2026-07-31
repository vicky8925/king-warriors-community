"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Trash2, ImagePlus } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Modal, FormField, inputClass } from "@/components/admin/Modal";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { gallery as seedGallery, galleryVideos, galleryCrud } from "@/lib/data/gallery";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { GalleryItem, GalleryMediaType } from "@/lib/types";

const seedItems = [...seedGallery, ...galleryVideos];
const emptyForm: Omit<GalleryItem, "id" | "createdAt"> = {
  type: "photo",
  url: "",
  caption: "",
  category: "Summits",
  width: 1200,
  height: 800,
};

/** Reads a File's real pixel dimensions so the masonry grid lays it out correctly. */
function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      resolve({ width: img.naturalWidth || 1200, height: img.naturalHeight || 800 });
      URL.revokeObjectURL(objectUrl);
    };
    img.onerror = () => resolve({ width: 1200, height: 800 });
    img.src = objectUrl;
  });
}

export default function AdminGalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>(seedItems);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    galleryCrud.fetchAll(seedItems).then(setItems);
  }, []);

  function openModal() {
    setForm(emptyForm);
    setFile(null);
    setPreview(null);
    setModalOpen(true);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  }

  async function handleSave() {
    if (!form.caption.trim()) {
      toast.error("Caption is required.");
      return;
    }
    if (form.type === "photo" && !file) {
      toast.error("Please choose a photo to upload.");
      return;
    }
    if (form.type === "video" && !form.url.trim()) {
      toast.error("Please paste a video embed URL.");
      return;
    }
    if (!isSupabaseConfigured || !supabase) {
      toast.error("Connect Supabase first — photo uploads need a live database + storage bucket.");
      return;
    }

    setUploading(true);

    let finalUrl = form.url;
    let width = form.width;
    let height = form.height;

    if (form.type === "photo" && file) {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("gallery").upload(path, file);
      if (uploadError) {
        setUploading(false);
        toast.error(`Upload failed: ${uploadError.message}`);
        return;
      }
      const { data } = supabase.storage.from("gallery").getPublicUrl(path);
      finalUrl = data.publicUrl;
      const dims = await getImageDimensions(file);
      width = dims.width;
      height = dims.height;
    }

    const createdAt = new Date().toISOString();
    const saved = await galleryCrud.create({ ...form, url: finalUrl, width, height, createdAt });
    setUploading(false);
    if (!saved) {
      toast.error("Saved the file, but couldn't save it to the gallery list — try logging out and back in.");
      return;
    }
    setItems((prev) => [saved, ...prev]);
    toast.success("Media added to gallery.");
    setForm(emptyForm);
    setFile(null);
    setPreview(null);
    setModalOpen(false);
  }

  async function handleDelete(id: string) {
    const ok = await galleryCrud.remove(id);
    if (isSupabaseConfigured && !ok) {
      toast.error("Couldn't delete from the database — try logging out and back in.");
      return;
    }
    setItems((prev) => prev.filter((g) => g.id !== id));
    toast.success("Removed from gallery.");
  }

  return (
    <div>
      <AdminPageHeader title="Gallery" description="Upload and manage photos and videos." actionLabel="Upload Media" onAction={openModal} />

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map((g) => (
          <GlassCard key={g.id} hover={false} className="p-0 overflow-hidden group relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={g.thumbnailUrl ?? g.url} alt={g.caption} className="w-full h-32 object-cover" loading="lazy" />
            <div className="p-3">
              <p className="text-xs text-[var(--color-ivory)] truncate">{g.caption}</p>
              <p className="text-[10px] text-[var(--color-ash-dim)] font-mono mt-1">{g.category}</p>
            </div>
            <button
              onClick={() => handleDelete(g.id)}
              className="absolute top-2 right-2 bg-black/60 rounded-lg p-1.5 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              aria-label="Delete"
            >
              <Trash2 size={13} />
            </button>
          </GlassCard>
        ))}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Upload Media">
        <FormField label="Type">
          <select
            className={inputClass}
            value={form.type}
            onChange={(e) => {
              setForm({ ...form, type: e.target.value as GalleryMediaType, url: "" });
              setFile(null);
              setPreview(null);
            }}
          >
            <option value="photo">Photo</option>
            <option value="video">Video (embed URL)</option>
          </select>
        </FormField>

        {form.type === "photo" ? (
          <FormField label="Photo">
            <label className="flex flex-col items-center justify-center gap-2 glass rounded-xl px-4 py-6 cursor-pointer hover:border-[var(--color-gold)]/40 transition-colors">
              {preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preview} alt="Preview" className="max-h-40 rounded-lg object-contain" />
              ) : (
                <>
                  <ImagePlus size={22} className="text-[var(--color-gold-bright)]" />
                  <span className="text-xs text-[var(--color-ash)]">Click to choose a photo from your computer</span>
                </>
              )}
              <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </label>
            {file && <p className="text-xs text-[var(--color-ash-dim)] mt-2 truncate">{file.name}</p>}
          </FormField>
        ) : (
          <FormField label="Video Embed URL">
            <input
              className={inputClass}
              value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
              placeholder="https://www.youtube.com/embed/..."
            />
          </FormField>
        )}

        <FormField label="Caption">
          <input className={inputClass} value={form.caption} onChange={(e) => setForm({ ...form, caption: e.target.value })} />
        </FormField>
        <FormField label="Category">
          <input className={inputClass} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="e.g. Summits" />
        </FormField>

        <Button className="w-full mt-2" onClick={handleSave} disabled={uploading}>
          {uploading ? "Uploading..." : "Add to Gallery"}
        </Button>
      </Modal>
    </div>
  );
}
