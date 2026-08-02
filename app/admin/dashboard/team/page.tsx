"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Pencil, Trash2, ImagePlus } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Modal, FormField, inputClass } from "@/components/admin/Modal";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { team as seedTeam, teamCrud } from "@/lib/data/team";
import { isSupabaseConfigured } from "@/lib/supabase";
import { uploadImage } from "@/lib/uploadImage";
import type { TeamMember, TeamRole } from "@/lib/types";

const ROLES: TeamRole[] = ["Founder", "Admin", "Moderator"];
const emptyForm: Omit<TeamMember, "id"> = {
  name: "",
  role: "Moderator",
  title: "",
  photoUrl: "",
  bio: "",
};

export default function AdminTeamPage() {
  const [items, setItems] = useState<TeamMember[]>(seedTeam);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    teamCrud.fetchAll(seedTeam).then(setItems);
  }, []);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setFile(null);
    setPreview(null);
    setModalOpen(true);
  }

  function openEdit(item: TeamMember) {
    setEditingId(item.id);
    setForm({ ...item });
    setFile(null);
    setPreview(item.photoUrl || null);
    setModalOpen(true);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  }

  async function handleSave() {
    if (!form.name.trim() || !form.title.trim()) {
      toast.error("Name and title are required.");
      return;
    }
    if (!editingId && !file) {
      toast.error("Please choose a photo.");
      return;
    }

    setUploading(true);
    let photoUrl = form.photoUrl;
    if (file) {
      const uploadedUrl = await uploadImage(file, "team");
      if (!uploadedUrl) {
        setUploading(false);
        toast.error("Photo upload failed. Please try again.");
        return;
      }
      photoUrl = uploadedUrl;
    }

    const payload = { ...form, photoUrl };
    if (editingId) {
      const ok = await teamCrud.update(editingId, payload);
      setUploading(false);
      if (isSupabaseConfigured && !ok) {
        toast.error("Couldn't save to the database — try logging out and back in.");
        return;
      }
      setItems((prev) => prev.map((t) => (t.id === editingId ? { ...t, ...payload } : t)));
      toast.success("Team member updated.");
    } else {
      const saved = await teamCrud.create(payload);
      setUploading(false);
      if (isSupabaseConfigured && !saved) {
        toast.error("Couldn't save to the database — try logging out and back in.");
        return;
      }
      setItems((prev) => [saved ?? { ...payload, id: `t-${Date.now()}` }, ...prev]);
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
        <FormField label="Photo">
          <label className="flex flex-col items-center justify-center gap-2 glass rounded-xl px-4 py-6 cursor-pointer hover:border-[var(--color-gold)]/40 transition-colors">
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="Preview" className="w-20 h-20 rounded-full object-cover" />
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
        <FormField label="Bio">
          <textarea className={inputClass + " min-h-[80px]"} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
        </FormField>
        <Button className="w-full mt-2" onClick={handleSave} disabled={uploading}>
          {uploading ? "Saving..." : editingId ? "Save Changes" : "Add Member"}
        </Button>
      </Modal>
    </div>
  );
}
