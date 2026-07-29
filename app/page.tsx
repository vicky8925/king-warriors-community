"use client";

import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";
import { Hero } from "@/components/sections/Hero";
import { AnnouncementBanner } from "@/components/sections/AnnouncementBanner";
import { StatsSection } from "@/components/sections/StatsSection";
import { OverviewSection } from "@/components/sections/OverviewSection";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { GlassCard, Badge } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { updates as mockUpdates, updatesCrud } from "@/lib/data/updates";
import { formatDate } from "@/lib/utils";
import { useEffect, useState } from "react";
import type { DailyUpdate } from "@/lib/types";

export default function HomePage() {
  const [updates, setUpdates] = useState<DailyUpdate[]>(mockUpdates);

  useEffect(() => {
    updatesCrud.fetchAll(mockUpdates).then(setUpdates);
  }, []);

  const pinned = updates.find((u) => u.pinned) ?? updates[0];
  const recent = pinned ? updates.filter((u) => u.id !== pinned.id).slice(0, 3) : [];

  return (
    <>
      <Hero />
      {pinned && <AnnouncementBanner update={pinned} />}
      <StatsSection />
      <OverviewSection />

      {/* Latest updates preview — only shown once there's at least one published update */}
      {recent.length > 0 && (
      <section className="section-padding py-20 sm:py-28">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <SectionHeading eyebrow="Stay Informed" title="Latest from the community" />
            <Link href="/daily-updates" className="inline-flex items-center gap-1.5 text-sm text-[var(--color-gold-bright)] shrink-0 hover:gap-2.5 transition-all">
              View all updates <ArrowRight size={15} />
            </Link>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            {recent.map((u, i) => (
              <GlassCard
                key={u.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="p-0 overflow-hidden flex flex-col"
              >
                {u.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={u.imageUrl} alt={u.title} className="h-44 w-full object-cover" loading="lazy" />
                )}
                <div className="p-6 flex flex-col flex-1">
                  <Badge className="self-start capitalize">{u.category.replace("-", " ")}</Badge>
                  <h3 className="font-display text-lg mt-3 text-[var(--color-ivory)] leading-snug">{u.title}</h3>
                  <p className="mt-2 text-sm text-[var(--color-ash)] leading-relaxed flex-1">{u.excerpt}</p>
                  <p className="mt-4 text-xs text-[var(--color-ash-dim)] font-mono">
                    {u.author} · {formatDate(u.createdAt)}
                  </p>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* Join CTA */}
      <section id="cta" className="section-padding py-24 sm:py-32">
        <GlassCard strong className="max-w-4xl mx-auto text-center py-16 px-6 sm:px-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(240,199,94,0.14),transparent_60%)]" />
          <div className="relative">
            <span className="eyebrow">Your Place Awaits</span>
            <h2 className="font-display mt-4 text-3xl sm:text-4xl text-[var(--color-ivory)] leading-tight">
              Ten thousand warriors rose. <span className="text-gold-gradient">You&apos;re next.</span>
            </h2>
            <p className="mt-4 text-[var(--color-ash)] max-w-lg mx-auto">
              Applications are reviewed within 48 hours. No cost to join — only a commitment to show up.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" onClick={() => (window.location.href = "/contact")}>
                Join Community <ArrowRight size={17} />
              </Button>
              <a
                href="https://wa.me/910000000000"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-[var(--color-ash)] hover:text-[var(--color-gold-bright)] transition-colors"
              >
                Message us on WhatsApp <ExternalLink size={14} />
              </a>
            </div>
          </div>
        </GlassCard>
      </section>
    </>
  );
}
