"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Pencil, Trash2, GripVertical } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Modal, FormField, inputClass } from "@/components/admin/Modal";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { rules as seedRules, rulesCrud } from "@/lib/data/rules";
import { isSupabaseConfigured } from "@/lib/supabase";
import type { CommunityRule } from "@/lib/types";

const emptyForm: Omit<CommunityRule, "id" | "order"> = { title: "", description: "" };

export default function AdminRulesPage() {
  const [items, setItems] = useState<CommunityRule[]>(seedRules);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    rulesCrud.fetchAll(seedRules).then(setItems);
  }, []);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(item: CommunityRule) {
    setEditingId(item.id);
    setForm({ title: item.title, description: item.description });
    setModalOpen(true);
  }

  async function handleSave() {
    if (!form.title.trim()) {
      toast.error("Title is required.");
      return;
    }
    if (editingId) {
      const ok = await rulesCrud.update(editingId, form);
      if (isSupabaseConfigured && !ok) {
        toast.error("Couldn't save to the database — try logging out and back in.");
        return;
      }
      setItems((prev) => prev.map((r) => (r.id === editingId ? { ...r, ...form } : r)));
      toast.success("Rule updated.");
    } else {
      const nextOrder = items.length + 1;
      const saved = await rulesCrud.create({ ...form, order: nextOrder });
      if (isSupabaseConfigured && !saved) {
        toast.error("Couldn't save to the database — try logging out and back in.");
        return;
      }
      setItems((prev) => [...prev, saved ?? { ...form, id: `r-${Date.now()}`, order: nextOrder }]);
      toast.success("Rule added.");
    }
    setModalOpen(false);
  }

  async function handleDelete(id: string) {
    const ok = await rulesCrud.remove(id);
    if (isSupabaseConfigured && !ok) {
      toast.error("Couldn't delete from the database — try logging out and back in.");
      return;
    }
    setItems((prev) => prev.filter((r) => r.id !== id));
    toast.success("Rule removed.");
  }

  return (
    <div>
      <AdminPageHeader title="Community Rules" description="Manage the rules shown on the public Rules page." actionLabel="Add Rule" onAction={openCreate} />

      <div className="space-y-3">
        {items
          .sort((a, b) => a.order - b.order)
          .map((r) => (
            <GlassCard key={r.id} hover={false} className="flex items-center gap-4">
              <GripVertical size={16} className="text-[var(--color-ash-dim)] shrink-0" />
              <span className="font-display text-xl text-gold-gradient shrink-0">{String(r.order).padStart(2, "0")}</span>
              <div className="min-w-0 flex-1">
                <p className="text-[var(--color-ivory)] font-medium">{r.title}</p>
                <p className="text-xs text-[var(--color-ash)] mt-1 truncate">{r.description}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => openEdit(r)} className="glass rounded-lg p-2 text-[var(--color-ash)] hover:text-[var(--color-gold-bright)] cursor-pointer">
                  <Pencil size={13} />
                </button>
                <button onClick={() => handleDelete(r.id)} className="glass rounded-lg p-2 text-[var(--color-ash)] hover:text-[var(--color-danger)] cursor-pointer">
                  <Trash2 size={13} />
                </button>
              </div>
            </GlassCard>
          ))}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? "Edit Rule" : "Add Rule"}>
        <FormField label="Title">
          <input className={inputClass} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </FormField>
        <FormField label="Description">
          <textarea className={inputClass + " min-h-[100px]"} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </FormField>
        <Button className="w-full mt-2" onClick={handleSave}>
          {editingId ? "Save Changes" : "Add Rule"}
        </Button>
      </Modal>
    </div>
  );
}
