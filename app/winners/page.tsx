"use client";

import { useEffect, useState } from "react";
import { Search, Trophy, Crown, Medal } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { GlassCard, Badge } from "@/components/ui/GlassCard";
import { winners as mockWinners, winnersCrud } from "@/lib/data/winners";
import { MemberGuard } from "@/components/MemberGuard";
import type { Winner, WinnerTier } from "@/lib/types";

const TIERS: { value: WinnerTier; label: string; icon: typeof Trophy }[] = [
  { value: "weekly", label: "Weekly Winners", icon: Medal },
  { value: "monthly", label: "Monthly Winners", icon: Trophy },
  { value: "hall-of-fame", label: "Hall of Fame", icon: Crown },
];

export default function WinnersPage() {
  return (
    <MemberGuard>
      <WinnersContent />
    </MemberGuard>
  );
}

function WinnersContent() {
  const [winners, setWinners] = useState<Winner[]>(mockWinners);
  const [query, setQuery] = useState("");

  useEffect(() => {
    winnersCrud.fetchAll(mockWinners).then(setWinners);
  }, []);

  return (
    <div className="section-padding py-16 sm:py-24">
      <div className="max-w-6xl mx-auto">
        <SectionHeading
          eyebrow="Recognition"
          title="Reward Winners"
          description="Every warrior who showed up, contributed, and led — celebrated here."
        />

        <div className="relative w-full sm:max-w-sm mt-10">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-ash-dim)]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search winners..."
            className="w-full glass rounded-full pl-11 pr-4 py-3 text-sm text-[var(--color-ivory)] placeholder:text-[var(--color-ash-dim)] outline-none focus:border-[var(--color-gold)]/50"
          />
        </div>

        {TIERS.map((tier) => {
          const list = winners.filter(
            (w) => w.tier === tier.value && (w.name + w.achievement).toLowerCase().includes(query.toLowerCase())
          );
          if (list.length === 0) return null;
          return (
            <section key={tier.value} className="mt-16">
              <div className="flex items-center gap-2.5">
                <tier.icon size={20} className="text-[var(--color-gold-bright)]" />
                <h3 className="font-display text-xl sm:text-2xl text-[var(--color-ivory)]">{tier.label}</h3>
              </div>
              <div className="hairline mt-4 mb-8" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {list.map((w, i) => (
                  <GlassCard
                    key={w.id}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.05 }}
                    className="text-center"
                  >
                    <div className="relative mx-auto w-20 h-20">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={w.photoUrl}
                        alt={w.name}
                        className="w-20 h-20 rounded-full object-cover ring-2 ring-[var(--color-gold)]/40"
                      />
                      <div className="absolute -bottom-1 -right-1 bg-[var(--color-gold)] text-[#141108] rounded-full p-1.5">
                        <tier.icon size={12} />
                      </div>
                    </div>
                    <h4 className="font-display text-base mt-4 text-[var(--color-ivory)]">{w.name}</h4>
                    <Badge className="mt-2">{w.badge}</Badge>
                    <p className="mt-3 text-sm text-[var(--color-ash)] leading-relaxed">{w.achievement}</p>
                    <div className="hairline my-4" />
                    <p className="text-sm text-[var(--color-gold-bright)] font-medium">{w.reward}</p>
                    <p className="text-xs text-[var(--color-ash-dim)] font-mono mt-1">{w.periodLabel}</p>
                  </GlassCard>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
