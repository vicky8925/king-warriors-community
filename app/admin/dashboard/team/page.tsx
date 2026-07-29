"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Pencil, Trash2 } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Modal, FormField, inputClass } from "@/components/admin/Modal";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { team as seedTeam, teamCrud } from "@/lib/data/team";
import { isSupabaseConfigured } from "@/lib/supabase";
import type { TeamMember, TeamRole } from "@/lib/types";

const ROLES: TeamRole[] = ["Founder", "Admin", "Moderator"];
const emptyForm: Omit<TeamMember, "id"> = {
  name: "",
  role: "Moderator",
  title: "",
  photoUrl: "https://i.pravatar.cc/400",
  bio: "",
};

export default function AdminTeamPage() {
  const [items, setItems] = useState<TeamMember[]>(seedTeam);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    teamCrud.fetchAll(seedTeam).then(setItems);
  }, []);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(item: TeamMember) {
    setEditingId(item.id);
    setForm({ ...item });
    setModalOpen(true);
  }

  async function handleSave() {
    if (!form.name.trim() || !form.title.trim()) {
      toast.error("Name and title are required.");
      return;
    }
    if (editingId) {
      const ok = await teamCrud.update(editingId, form);
      if (isSupabaseConfigured && !ok) {
        toast.error("Couldn't save to the database — try logging out and back in.");
        return;
      }
      setItems((prev) => prev.map((t) => (t.id === editingId ? { ...t, ...form } : t)));
      toast.success("Team member updated.");
    } else {
      const saved = await teamCrud.create(form);
      if (isSupabaseConfigured && !saved) {
        toast.error("Couldn't save to the database — try logging out and back in.");
        return;
      }
      setItems((prev) => [saved ?? { ...form, id: `t-${Date.now()}` }, ...prev]);
      toast.success("Team member added.");
    }
    setModalOpen(false);
  }

  async function handleDelete(id: string) {
    const ok = await teamCrud.remove(id);
    if (isSupabaseConfigured && !ok) {
      toast.error("Couldn't delete from the database — try logging out and back in.");
      return;
    }
    setItems((prev) => prev.filter((t) => t.id !== id));
    toast.success("Team member removed.");
  }

  return (
    <div>
      <AdminPageHeader title="Community Team" description="Manage founder, admin, and moderator profiles." actionLabel="Add Member" onAction={openCreate} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((t) => (
          <GlassCard key={t.id} hover={false} className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={t.photoUrl} alt={t.name} className="w-12 h-12 rounded-full object-cover shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-[var(--color-ivory)] font-medium truncate">{t.name}</p>
              <p className="text-xs text-[var(--color-gold-bright)] font-mono">{t.role}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button onClick={() => openEdit(t)} className="glass rounded-lg p-2 text-[var(--color-ash)] hover:text-[var(--color-gold-bright)] cursor-pointer">
                <Pencil size={13} />
              </button>
              <button onClick={() => handleDelete(t.id)} className="glass rounded-lg p-2 text-[var(--color-ash)] hover:text-[var(--color-danger)] cursor-pointer">
                <Trash2 size={13} />
              </button>
            </div>
          </GlassCard>
        ))}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? "Edit Team Member" : "Add Team Member"}>
        <FormField label="Name">
          <input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </FormField>
        <FormField label="Role">
          <select className={inputClass} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as TeamRole })}>
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Title">
          <input className={inputClass} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Head of Events" />
        </FormField>
        <FormField label="Photo URL">
          <input className={inputClass} value={form.photoUrl} onChange={(e) => setForm({ ...form, photoUrl: e.target.value })} />
        </FormField>
        <FormField label="Bio">
          <textarea className={inputClass + " min-h-[80px]"} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
        </FormField>
        <Button className="w-full mt-2" onClick={handleSave}>
          {editingId ? "Save Changes" : "Add Member"}
        </Button>
      </Modal>
    </div>
  );
}
