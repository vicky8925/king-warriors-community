"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Search, Trash2, Mail, Phone } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { GlassCard } from "@/components/ui/GlassCard";
import { membersCrud } from "@/lib/data/members";
import { formatDateTime } from "@/lib/utils";
import type { Member } from "@/lib/types";

export default function AdminMembersPage() {
  const [items, setItems] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    membersCrud.fetchAll([]).then((data) => {
      setItems(data);
      setLoading(false);
    });
  }, []);

  async function handleDelete(id: string) {
    const ok = await membersCrud.remove(id);
    if (!ok) {
      toast.error("Couldn't delete — try logging out and back in.");
      return;
    }
    setItems((prev) => prev.filter((m) => m.id !== id));
    toast.success("Removed.");
  }

  const filtered = items.filter((m) => (m.name + m.email).toLowerCase().includes(query.toLowerCase()));

  return (
    <div>
      <AdminPageHeader title="Members" description={`${items.length} people have signed up to join the community.`} />

      <div className="relative w-full sm:max-w-sm mb-6">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-ash-dim)]" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or email..."
          className="w-full glass rounded-full pl-11 pr-4 py-2.5 text-sm text-[var(--color-ivory)] placeholder:text-[var(--color-ash-dim)] outline-none focus:border-[var(--color-gold)]/50"
        />
      </div>

      {loading ? (
        <p className="text-sm text-[var(--color-ash)]">Loading…</p>
      ) : filtered.length === 0 ? (
        <GlassCard hover={false}>
          <p className="text-sm text-[var(--color-ash)]">
            {items.length === 0 ? "No signups yet — share the /join page to start growing your member list." : "No matches for your search."}
          </p>
        </GlassCard>
      ) : (
        <div className="space-y-3">
          {filtered.map((m) => (
            <GlassCard key={m.id} hover={false} className="flex items-start justify-between gap-4 flex-wrap">
              <div className="min-w-0 flex-1">
                <p className="text-[var(--color-ivory)] font-medium">{m.name}</p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-xs text-[var(--color-ash)]">
                  <span className="flex items-center gap-1.5">
                    <Mail size={12} /> {m.email}
                  </span>
                  {m.phone && (
                    <span className="flex items-center gap-1.5">
                      <Phone size={12} /> {m.phone}
                    </span>
                  )}
                  <span className="font-mono text-[var(--color-ash-dim)]">{formatDateTime(m.joinedAt)}</span>
                </div>
                {m.whyJoin && <p className="text-sm text-[var(--color-ash)] mt-2 max-w-xl">{m.whyJoin}</p>}
              </div>
              <button
                onClick={() => handleDelete(m.id)}
                className="glass rounded-lg p-2 text-[var(--color-ash)] hover:text-[var(--color-danger)] cursor-pointer shrink-0"
                aria-label="Delete"
              >
                <Trash2 size={14} />
              </button>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
