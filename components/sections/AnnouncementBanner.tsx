import Link from "next/link";
import { Megaphone, ArrowRight } from "lucide-react";
import { GlassCard, Badge } from "@/components/ui/GlassCard";
import { formatDate } from "@/lib/utils";
import type { DailyUpdate } from "@/lib/types";

export function AnnouncementBanner({ update }: { update: DailyUpdate }) {
  return (
    <section className="section-padding py-10 sm:py-12 relative z-20">
      <GlassCard strong className="max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 py-5">
        <div className="rounded-full p-3 bg-[var(--color-gold)]/12 text-[var(--color-gold-bright)] shrink-0">
          <Megaphone size={20} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge>Latest Announcement</Badge>
            <span className="text-xs text-[var(--color-ash-dim)] font-mono">{formatDate(update.createdAt)}</span>
          </div>
          <p className="mt-2 text-[var(--color-ivory)] font-medium leading-snug">{update.title}</p>
        </div>
        <Link
          href="/daily-updates"
          className="shrink-0 inline-flex items-center gap-1.5 text-sm text-[var(--color-gold-bright)] hover:gap-2.5 transition-all self-start sm:self-center"
        >
          Read more <ArrowRight size={15} />
        </Link>
      </GlassCard>
    </section>
  );
}
