"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Trash2, Upload } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Modal, FormField, inputClass } from "@/components/admin/Modal";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { gallery as seedGallery, galleryVideos, galleryCrud } from "@/lib/data/gallery";
import { isSupabaseConfigured } from "@/lib/supabase";
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

// NOTE: file upload UI below stores a URL directly. To support real image
// uploads, wire it to Supabase Storage and insert the returned public URL.
export default function AdminGalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>(seedItems);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    galleryCrud.fetchAll(seedItems).then(setItems);
  }, []);

  async function handleSave() {
    if (!form.url.trim() || !form.caption.trim()) {
      toast.error("URL and caption are required.");
      return;
    }
    const createdAt = new Date().toISOString();
    const saved = await galleryCrud.create({ ...form, createdAt });
    if (isSupabaseConfigured && !saved) {
      toast.error("Couldn't save to the database — try logging out and back in.");
      return;
    }
    setItems((prev) => [saved ?? { ...form, id: `g-${Date.now()}`, createdAt }, ...prev]);
    toast.success("Media added to gallery.");
    setForm(emptyForm);
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
      <AdminPageHeader title="Gallery" description="Upload and manage photos and videos." actionLabel="Upload Media" onAction={() => setModalOpen(true)} />

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
          <select className={inputClass} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as GalleryMediaType })}>
            <option value="photo">Photo</option>
            <option value="video">Video (embed URL)</option>
          </select>
        </FormField>
        <FormField label={form.type === "photo" ? "Image URL" : "Video Embed URL"}>
          <input className={inputClass} value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://..." />
        </FormField>
        <FormField label="Caption">
          <input className={inputClass} value={form.caption} onChange={(e) => setForm({ ...form, caption: e.target.value })} />
        </FormField>
        <FormField label="Category">
          <input className={inputClass} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="e.g. Summits" />
        </FormField>
        <p className="text-xs text-[var(--color-ash-dim)] flex items-center gap-2 mb-4">
          <Upload size={13} /> Direct file upload connects once Supabase Storage is configured.
        </p>
        <Button className="w-full" onClick={handleSave}>
          Add to Gallery
        </Button>
      </Modal>
    </div>
  );
}
