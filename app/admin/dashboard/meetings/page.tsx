"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Pencil, Trash2 } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Modal, FormField, inputClass } from "@/components/admin/Modal";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { meetings as seedMeetings, meetingsCrud } from "@/lib/data/meetings";
import { isSupabaseConfigured } from "@/lib/supabase";
import { formatDateTime } from "@/lib/utils";
import type { Meeting } from "@/lib/types";

const emptyForm: Omit<Meeting, "id"> = {
  title: "",
  agenda: [""],
  scheduledAt: new Date().toISOString().slice(0, 16),
  summary: "",
};

export default function AdminMeetingsPage() {
  const [items, setItems] = useState<Meeting[]>(seedMeetings);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    meetingsCrud.fetchAll(seedMeetings).then(setItems);
  }, []);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(item: Meeting) {
    setEditingId(item.id);
    setForm({ ...item, scheduledAt: item.scheduledAt.slice(0, 16), agenda: item.agenda.length ? item.agenda : [""] });
    setModalOpen(true);
  }

  async function handleSave() {
    if (!form.title.trim()) {
      toast.error("Title is required.");
      return;
    }
    const payload = { ...form, scheduledAt: new Date(form.scheduledAt).toISOString(), agenda: form.agenda.filter(Boolean) };
    if (editingId) {
      const ok = await meetingsCrud.update(editingId, payload);
      if (isSupabaseConfigured && !ok) {
        toast.error("Couldn't save to the database — try logging out and back in.");
        return;
      }
      setItems((prev) => prev.map((m) => (m.id === editingId ? { ...m, ...payload } : m)));
      toast.success("Meeting updated.");
    } else {
      const saved = await meetingsCrud.create(payload);
      if (isSupabaseConfigured && !saved) {
        toast.error("Couldn't save to the database — try logging out and back in.");
        return;
      }
      setItems((prev) => [saved ?? { ...payload, id: `m-${Date.now()}` }, ...prev]);
      toast.success("Meeting scheduled.");
    }
    setModalOpen(false);
  }

  async function handleDelete(id: string) {
    const ok = await meetingsCrud.remove(id);
    if (isSupabaseConfigured && !ok) {
      toast.error("Couldn't delete from the database — try logging out and back in.");
      return;
    }
    setItems((prev) => prev.filter((m) => m.id !== id));
    toast.success("Meeting removed.");
  }

  return (
    <div>
      <AdminPageHeader title="Meetings" description="Schedule meetings, set agendas, and post summaries afterward." actionLabel="Schedule Meeting" onAction={openCreate} />

      <div className="space-y-3">
        {items.map((m) => (
          <GlassCard key={m.id} hover={false} className="flex items-center justify-between gap-4 flex-wrap">
            <div className="min-w-0 flex-1">
              <span className="text-xs text-[var(--color-gold-bright)] font-mono">{formatDateTime(m.scheduledAt)}</span>
              <p className="text-[var(--color-ivory)] font-medium mt-1 truncate">{m.title}</p>
              <p className="text-xs text-[var(--color-ash-dim)] mt-1">{m.agenda.length} agenda items{m.summary ? " · summary posted" : ""}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={() => openEdit(m)} className="glass rounded-lg p-2 text-[var(--color-ash)] hover:text-[var(--color-gold-bright)] cursor-pointer">
                <Pencil size={14} />
              </button>
              <button onClick={() => handleDelete(m.id)} className="glass rounded-lg p-2 text-[var(--color-ash)] hover:text-[var(--color-danger)] cursor-pointer">
                <Trash2 size={14} />
              </button>
            </div>
          </GlassCard>
        ))}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? "Edit Meeting" : "Schedule Meeting"}>
        <FormField label="Title">
          <input className={inputClass} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </FormField>
        <FormField label="Date & Time">
          <input type="datetime-local" className={inputClass} value={form.scheduledAt} onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })} />
        </FormField>
        <FormField label="Agenda (one item per line)">
          <textarea
            className={inputClass + " min-h-[100px]"}
            value={form.agenda.join("\n")}
            onChange={(e) => setForm({ ...form, agenda: e.target.value.split("\n") })}
          />
        </FormField>
        <FormField label="Summary (fill in after the meeting)">
          <textarea className={inputClass + " min-h-[80px]"} value={form.summary ?? ""} onChange={(e) => setForm({ ...form, summary: e.target.value })} />
        </FormField>
        <Button className="w-full mt-2" onClick={handleSave}>
          {editingId ? "Save Changes" : "Schedule Meeting"}
        </Button>
      </Modal>
    </div>
  );
}
