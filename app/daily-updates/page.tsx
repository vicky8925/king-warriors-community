"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search, PlayCircle } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { GlassCard, Badge } from "@/components/ui/GlassCard";
import { updates as mockUpdates, updatesCrud } from "@/lib/data/updates";
import { formatDate } from "@/lib/utils";
import { MemberGuard } from "@/components/MemberGuard";
import type { DailyUpdate, UpdateCategory } from "@/lib/types";

const CATEGORIES: { value: UpdateCategory | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "announcement", label: "Announcements" },
  { value: "news", label: "News" },
  { value: "event-recap", label: "Event Recaps" },
  { value: "achievement", label: "Achievements" },
  { value: "general", label: "General" },
];

export default function DailyUpdatesPage() {
  return (
    <MemberGuard>
      <DailyUpdatesContent />
    </MemberGuard>
  );
}

function DailyUpdatesContent() {
  const [updates, setUpdates] = useState<DailyUpdate[]>(mockUpdates);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<UpdateCategory | "all">("all");

  // Loads from Supabase when configured; otherwise keeps the mock data
  // that's already showing, so the page never looks empty.
  useEffect(() => {
    updatesCrud.fetchAll(mockUpdates).then(setUpdates);
  }, []);

  const filtered = useMemo(() => {
    return updates
      .filter((u) => category === "all" || u.category === category)
      .filter((u) => (u.title + u.excerpt).toLowerCase().includes(query.toLowerCase()))
      .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [updates, query, category]);

  return (
    <div className="section-padding py-16 sm:py-24">
      <div className="max-w-6xl mx-auto">
        <SectionHeading eyebrow="Community Newsroom" title="Daily Updates" description="Announcements, news, and recaps — everything worth knowing, in one feed." />

        {/* Controls */}
        <div className="mt-10 flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
          <div className="relative w-full md:max-w-sm">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-ash-dim)]" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search updates..."
              className="w-full glass rounded-full pl-11 pr-4 py-3 text-sm text-[var(--color-ivory)] placeholder:text-[var(--color-ash-dim)] outline-none focus:border-[var(--color-gold)]/50"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c.value}
                onClick={() => setCategory(c.value)}
                className={`px-4 py-2 rounded-full text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer border ${
                  category === c.value
                    ? "bg-[var(--color-gold)]/15 border-[var(--color-gold)]/40 text-[var(--color-gold-bright)]"
                    : "border-[var(--color-hairline)] text-[var(--color-ash)] hover:text-[var(--color-ivory)]"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((u, i) => (
            <GlassCard
              key={u.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.04 }}
              className="p-0 overflow-hidden flex flex-col"
            >
              <div className="relative h-44 w-full bg-[var(--color-obsidian-2)]">
                {u.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={u.imageUrl} alt={u.title} className="h-full w-full object-cover" loading="lazy" />
                )}
                {u.videoUrl && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <PlayCircle size={40} className="text-[var(--color-gold-bright)]" />
                  </div>
                )}
                {u.pinned && (
                  <Badge className="absolute top-3 left-3 bg-[var(--color-void)]/80">Pinned</Badge>
                )}
              </div>
              <div className="p-6 flex flex-col flex-1">
                <Badge className="self-start capitalize">{u.category.replace("-", " ")}</Badge>
                <h3 className="font-display text-lg mt-3 text-[var(--color-ivory)] leading-snug">{u.title}</h3>
                <p className="mt-2 text-sm text-[var(--color-ash)] leading-relaxed flex-1">{u.excerpt}</p>
                <div className="mt-4 flex items-center gap-2">
                  {u.authorAvatarUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={u.authorAvatarUrl} alt={u.author} className="w-6 h-6 rounded-full object-cover" />
                  )}
                  <p className="text-xs text-[var(--color-ash-dim)] font-mono">
                    {u.author} · {formatDate(u.createdAt)}
                  </p>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>

        {filtered.length === 0 && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-[var(--color-ash)] mt-16">
            No updates match your search. Try a different keyword or category.
          </motion.p>
        )}
      </div>
    </div>
  );
}
