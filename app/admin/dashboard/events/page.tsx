"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Pencil, Trash2, ImagePlus } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Modal, FormField, inputClass } from "@/components/admin/Modal";
import { GlassCard, Badge } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { events as seedEvents, eventsCrud } from "@/lib/data/events";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { formatDateTime } from "@/lib/utils";
import type { CommunityEvent, EventStatus } from "@/lib/types";

const emptyForm: Omit<CommunityEvent, "id"> = {
  title: "",
  description: "",
  imageUrl: "",
  location: "",
  isOnline: false,
  startAt: new Date().toISOString().slice(0, 16),
  registerUrl: "",
  status: "upcoming",
};

async function uploadEventImage(file: File): Promise<string | null> {
  if (!supabase) return null;
  const ext = file.name.split(".").pop() || "jpg";
  const path = `events/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage.from("gallery").upload(path, file);
  if (error) {
    toast.error(`Image upload failed: ${error.message}`);
    return null;
  }
  return supabase.storage.from("gallery").getPublicUrl(path).data.publicUrl;
}

export default function AdminEventsPage() {
  const [items, setItems] = useState<CommunityEvent[]>(seedEvents);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    eventsCrud.fetchAll(seedEvents).then(setItems);
  }, []);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setFile(null);
    setPreview(null);
    setModalOpen(true);
  }

  function openEdit(item: CommunityEvent) {
    setEditingId(item.id);
    setForm({ ...item, startAt: item.startAt.slice(0, 16) });
    setFile(null);
    setPreview(item.imageUrl ?? null);
    setModalOpen(true);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  }

  async function handleSave() {
    if (!form.title.trim() || !form.location.trim()) {
      toast.error("Title and location are required.");
      return;
    }

    setUploading(true);
    let imageUrl = form.imageUrl;
    if (file) {
      const uploadedUrl = await uploadEventImage(file);
      if (!uploadedUrl) {
        setUploading(false);
        return;
      }
      imageUrl = uploadedUrl;
    }

    const payload = { ...form, imageUrl, startAt: new Date(form.startAt).toISOString() };
    if (editingId) {
      const ok = await eventsCrud.update(editingId, payload);
      setUploading(false);
      if (isSupabaseConfigured && !ok) {
        toast.error("Couldn't save to the database — try logging out and back in.");
        return;
      }
      setItems((prev) => prev.map((e) => (e.id === editingId ? { ...e, ...payload } : e)));
      toast.success("Event updated.");
    } else {
      const saved = await eventsCrud.create(payload);
      setUploading(false);
      if (isSupabaseConfigured && !saved) {
        toast.error("Couldn't save to the database — try logging out and back in.");
        return;
      }
      const newItem: CommunityEvent = saved ?? { ...payload, id: `e-${Date.now()}` };
      setItems((prev) => [newItem, ...prev]);
      toast.success("Event created.");
    }
    setModalOpen(false);
  }

  async function handleDelete(id: string) {
    const ok = await eventsCrud.remove(id);
    if (isSupabaseConfigured && !ok) {
      toast.error("Couldn't delete from the database — try logging out and back in.");
      return;
    }
    setItems((prev) => prev.filter((e) => e.id !== id));
    toast.success("Event deleted.");
  }

  return (
    <div>
      <AdminPageHeader title="Events" description="Manage upcoming and past community events." actionLabel="New Event" onAction={openCreate} />

      <div className="space-y-3">
        {items.map((e) => (
          <GlassCard key={e.id} hover={false} className="flex items-center justify-between gap-4 flex-wrap">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <Badge className="capitalize">{e.status}</Badge>
                <span className="text-xs text-[var(--color-ash-dim)] font-mono">{formatDateTime(e.startAt)}</span>
              </div>
              <p className="text-[var(--color-ivory)] font-medium mt-1 truncate">{e.title}</p>
              <p className="text-xs text-[var(--color-ash)] mt-1">{e.location}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={() => openEdit(e)} className="glass rounded-lg p-2 text-[var(--color-ash)] hover:text-[var(--color-gold-bright)] cursor-pointer">
                <Pencil size={14} />
              </button>
              <button onClick={() => handleDelete(e.id)} className="glass rounded-lg p-2 text-[var(--color-ash)] hover:text-[var(--color-danger)] cursor-pointer">
                <Trash2 size={14} />
              </button>
            </div>
          </GlassCard>
        ))}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? "Edit Event" : "New Event"}>
        <FormField label="Title">
          <input className={inputClass} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </FormField>
        <FormField label="Description">
          <textarea className={inputClass + " min-h-[70px]"} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </FormField>
        <FormField label="Location">
          <input className={inputClass} value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
        </FormField>
        <FormField label="Online event?">
          <select className={inputClass} value={form.isOnline ? "yes" : "no"} onChange={(e) => setForm({ ...form, isOnline: e.target.value === "yes" })}>
            <option value="no">No — in person</option>
            <option value="yes">Yes — online</option>
          </select>
        </FormField>
        <FormField label="Date & Time">
          <input type="datetime-local" className={inputClass} value={form.startAt} onChange={(e) => setForm({ ...form, startAt: e.target.value })} />
        </FormField>
        <FormField label="Status">
          <select className={inputClass} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as EventStatus })}>
            <option value="upcoming">Upcoming</option>
            <option value="past">Past</option>
          </select>
        </FormField>
        <FormField label="Register URL (optional)">
          <input className={inputClass} value={form.registerUrl ?? ""} onChange={(e) => setForm({ ...form, registerUrl: e.target.value })} />
        </FormField>
        <FormField label="Event Photo (optional)">
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
        <Button className="w-full mt-2" onClick={handleSave} disabled={uploading}>
          {uploading ? "Saving..." : editingId ? "Save Changes" : "Create Event"}
        </Button>
      </Modal>
    </div>
  );
}
