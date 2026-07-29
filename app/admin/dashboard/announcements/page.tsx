"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Pencil, Trash2, Pin } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Modal, FormField, inputClass } from "@/components/admin/Modal";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { updates as seedUpdates, updatesCrud } from "@/lib/data/updates";
import { isSupabaseConfigured } from "@/lib/supabase";
import { formatDate } from "@/lib/utils";
import type { DailyUpdate, UpdateCategory } from "@/lib/types";

const CATEGORIES: UpdateCategory[] = ["announcement", "news", "event-recap", "achievement", "general"];
const emptyForm: Omit<DailyUpdate, "id" | "createdAt"> = {
  title: "",
  excerpt: "",
  content: "",
  category: "announcement",
  imageUrl: "",
  author: "",
};

export default function AdminAnnouncementsPage() {
  const [items, setItems] = useState<DailyUpdate[]>(seedUpdates);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    updatesCrud.fetchAll(seedUpdates).then(setItems);
  }, []);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(item: DailyUpdate) {
    setEditingId(item.id);
    setForm({ ...item });
    setModalOpen(true);
  }

  async function handleSave() {
    if (!form.title.trim() || !form.excerpt.trim()) {
      toast.error("Title and excerpt are required.");
      return;
    }
    if (editingId) {
      const ok = await updatesCrud.update(editingId, form);
      if (isSupabaseConfigured && !ok) {
        toast.error("Couldn't save to the database — try logging out and back in.");
        return;
      }
      setItems((prev) => prev.map((u) => (u.id === editingId ? { ...u, ...form } : u)));
      toast.success("Announcement updated.");
    } else {
      const createdAt = new Date().toISOString();
      const saved = await updatesCrud.create({ ...form, createdAt });
      if (isSupabaseConfigured && !saved) {
        toast.error("Couldn't save to the database — try logging out and back in.");
        return;
      }
      const newItem: DailyUpdate = saved ?? { ...form, id: `u-${Date.now()}`, createdAt };
      setItems((prev) => [newItem, ...prev]);
      toast.success("Announcement created.");
    }
    setModalOpen(false);
  }

  async function handleDelete(id: string) {
    const ok = await updatesCrud.remove(id);
    if (isSupabaseConfigured && !ok) {
      toast.error("Couldn't delete from the database — try logging out and back in.");
      return;
    }
    setItems((prev) => prev.filter((u) => u.id !== id));
    toast.success("Announcement deleted.");
  }

  async function togglePin(id: string) {
    const item = items.find((u) => u.id === id);
    if (!item) return;
    const ok = await updatesCrud.update(id, { pinned: !item.pinned });
    if (isSupabaseConfigured && !ok) {
      toast.error("Couldn't update pin status in the database.");
      return;
    }
    setItems((prev) => prev.map((u) => (u.id === id ? { ...u, pinned: !u.pinned } : { ...u, pinned: false })));
  }

  return (
    <div>
      <AdminPageHeader
        title="Announcements"
        description="Create and manage daily updates shown across the community."
        actionLabel="New Announcement"
        onAction={openCreate}
      />

      <div className="space-y-3">
        {items.map((u) => (
          <GlassCard key={u.id} hover={false} className="flex items-center justify-between gap-4 flex-wrap">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-mono uppercase text-[var(--color-gold-bright)]">{u.category}</span>
                {u.pinned && <Pin size={12} className="text-[var(--color-gold-bright)]" />}
              </div>
              <p className="text-[var(--color-ivory)] font-medium mt-1 truncate">{u.title}</p>
              <p className="text-xs text-[var(--color-ash-dim)] font-mono mt-1">
                {u.author} · {formatDate(u.createdAt)}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={() => togglePin(u.id)} className="glass rounded-lg p-2 text-[var(--color-ash)] hover:text-[var(--color-gold-bright)] cursor-pointer" aria-label="Pin">
                <Pin size={14} />
              </button>
              <button onClick={() => openEdit(u)} className="glass rounded-lg p-2 text-[var(--color-ash)] hover:text-[var(--color-gold-bright)] cursor-pointer" aria-label="Edit">
                <Pencil size={14} />
              </button>
              <button onClick={() => handleDelete(u.id)} className="glass rounded-lg p-2 text-[var(--color-ash)] hover:text-[var(--color-danger)] cursor-pointer" aria-label="Delete">
                <Trash2 size={14} />
              </button>
            </div>
          </GlassCard>
        ))}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? "Edit Announcement" : "New Announcement"}>
        <FormField label="Title">
          <input className={inputClass} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </FormField>
        <FormField label="Category">
          <select className={inputClass} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as UpdateCategory })}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Excerpt">
          <textarea className={inputClass + " min-h-[80px]"} value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} />
        </FormField>
        <FormField label="Full Content">
          <textarea className={inputClass + " min-h-[120px]"} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
        </FormField>
        <FormField label="Image URL (optional)">
          <input className={inputClass} value={form.imageUrl ?? ""} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} />
        </FormField>
        <FormField label="Author">
          <input className={inputClass} value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} />
        </FormField>
        <Button className="w-full mt-2" onClick={handleSave}>
          {editingId ? "Save Changes" : "Publish Announcement"}
        </Button>
      </Modal>
    </div>
  );
}
