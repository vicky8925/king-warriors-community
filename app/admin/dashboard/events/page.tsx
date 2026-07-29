"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Pencil, Trash2 } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Modal, FormField, inputClass } from "@/components/admin/Modal";
import { GlassCard, Badge } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { events as seedEvents, eventsCrud } from "@/lib/data/events";
import { isSupabaseConfigured } from "@/lib/supabase";
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

export default function AdminEventsPage() {
  const [items, setItems] = useState<CommunityEvent[]>(seedEvents);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    eventsCrud.fetchAll(seedEvents).then(setItems);
  }, []);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(item: CommunityEvent) {
    setEditingId(item.id);
    setForm({ ...item, startAt: item.startAt.slice(0, 16) });
    setModalOpen(true);
  }

  async function handleSave() {
    if (!form.title.trim() || !form.location.trim()) {
      toast.error("Title and location are required.");
      return;
    }
    const payload = { ...form, startAt: new Date(form.startAt).toISOString() };
    if (editingId) {
      const ok = await eventsCrud.update(editingId, payload);
      if (isSupabaseConfigured && !ok) {
        toast.error("Couldn't save to the database — try logging out and back in.");
        return;
      }
      setItems((prev) => prev.map((e) => (e.id === editingId ? { ...e, ...payload } : e)));
      toast.success("Event updated.");
    } else {
      const saved = await eventsCrud.create(payload);
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
        <FormField label="Image URL (optional)">
          <input className={inputClass} value={form.imageUrl ?? ""} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} />
        </FormField>
        <Button className="w-full mt-2" onClick={handleSave}>
          {editingId ? "Save Changes" : "Create Event"}
        </Button>
      </Modal>
    </div>
  );
}
