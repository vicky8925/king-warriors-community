"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Pencil, Trash2 } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Modal, FormField, inputClass } from "@/components/admin/Modal";
import { GlassCard, Badge } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { winners as seedWinners, winnersCrud } from "@/lib/data/winners";
import { isSupabaseConfigured } from "@/lib/supabase";
import type { Winner, WinnerTier } from "@/lib/types";

const TIERS: WinnerTier[] = ["weekly", "monthly", "hall-of-fame"];
const emptyForm: Omit<Winner, "id" | "date"> = {
  name: "",
  photoUrl: "https://i.pravatar.cc/300",
  tier: "weekly",
  reward: "",
  achievement: "",
  badge: "",
  periodLabel: "",
};

export default function AdminWinnersPage() {
  const [items, setItems] = useState<Winner[]>(seedWinners);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    winnersCrud.fetchAll(seedWinners).then(setItems);
  }, []);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(item: Winner) {
    setEditingId(item.id);
    setForm({ ...item });
    setModalOpen(true);
  }

  async function handleSave() {
    if (!form.name.trim() || !form.achievement.trim()) {
      toast.error("Name and achievement are required.");
      return;
    }
    if (editingId) {
      const ok = await winnersCrud.update(editingId, form);
      if (isSupabaseConfigured && !ok) {
        toast.error("Couldn't save to the database — try logging out and back in.");
        return;
      }
      setItems((prev) => prev.map((w) => (w.id === editingId ? { ...w, ...form } : w)));
      toast.success("Winner updated.");
    } else {
      const date = new Date().toISOString();
      const saved = await winnersCrud.create({ ...form, date });
      if (isSupabaseConfigured && !saved) {
        toast.error("Couldn't save to the database — try logging out and back in.");
        return;
      }
      const newItem: Winner = saved ?? { ...form, id: `w-${Date.now()}`, date };
      setItems((prev) => [newItem, ...prev]);
      toast.success("Winner added.");
    }
    setModalOpen(false);
  }

  async function handleDelete(id: string) {
    const ok = await winnersCrud.remove(id);
    if (isSupabaseConfigured && !ok) {
      toast.error("Couldn't delete from the database — try logging out and back in.");
      return;
    }
    setItems((prev) => prev.filter((w) => w.id !== id));
    toast.success("Winner removed.");
  }

  return (
    <div>
      <AdminPageHeader title="Reward Winners" description="Manage weekly, monthly, and Hall of Fame winners." actionLabel="Add Winner" onAction={openCreate} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((w) => (
          <GlassCard key={w.id} hover={false}>
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={w.photoUrl} alt={w.name} className="w-12 h-12 rounded-full object-cover ring-1 ring-[var(--color-gold)]/30" />
              <div className="min-w-0 flex-1">
                <p className="text-[var(--color-ivory)] font-medium truncate">{w.name}</p>
                <Badge className="mt-1 capitalize">{w.tier.replace("-", " ")}</Badge>
              </div>
            </div>
            <p className="text-xs text-[var(--color-ash)] mt-3 leading-relaxed">{w.achievement}</p>
            <div className="flex items-center justify-between mt-4">
              <span className="text-xs text-[var(--color-gold-bright)] font-mono">{w.reward}</span>
              <div className="flex gap-2">
                <button onClick={() => openEdit(w)} className="glass rounded-lg p-2 text-[var(--color-ash)] hover:text-[var(--color-gold-bright)] cursor-pointer">
                  <Pencil size={13} />
                </button>
                <button onClick={() => handleDelete(w.id)} className="glass rounded-lg p-2 text-[var(--color-ash)] hover:text-[var(--color-danger)] cursor-pointer">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? "Edit Winner" : "Add Winner"}>
        <FormField label="Name">
          <input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </FormField>
        <FormField label="Photo URL">
          <input className={inputClass} value={form.photoUrl} onChange={(e) => setForm({ ...form, photoUrl: e.target.value })} />
        </FormField>
        <FormField label="Tier">
          <select className={inputClass} value={form.tier} onChange={(e) => setForm({ ...form, tier: e.target.value as WinnerTier })}>
            {TIERS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Badge Label">
          <input className={inputClass} value={form.badge} onChange={(e) => setForm({ ...form, badge: e.target.value })} placeholder="e.g. Top Recruiter" />
        </FormField>
        <FormField label="Achievement">
          <textarea className={inputClass + " min-h-[70px]"} value={form.achievement} onChange={(e) => setForm({ ...form, achievement: e.target.value })} />
        </FormField>
        <FormField label="Reward">
          <input className={inputClass} value={form.reward} onChange={(e) => setForm({ ...form, reward: e.target.value })} placeholder="e.g. ₹2,000 + Gold Badge" />
        </FormField>
        <FormField label="Period Label">
          <input className={inputClass} value={form.periodLabel} onChange={(e) => setForm({ ...form, periodLabel: e.target.value })} placeholder="e.g. Week 29, 2026" />
        </FormField>
        <Button className="w-full mt-2" onClick={handleSave}>
          {editingId ? "Save Changes" : "Add Winner"}
        </Button>
      </Modal>
    </div>
  );
}
