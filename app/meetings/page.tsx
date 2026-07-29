"use client";

import { useEffect, useState } from "react";
import { CalendarDays, FileText, ListChecks, LayoutGrid, List } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { GlassCard, Badge } from "@/components/ui/GlassCard";
import { meetings as mockMeetings, meetingsCrud } from "@/lib/data/meetings";
import { formatDateTime } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Meeting } from "@/lib/types";

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>(mockMeetings);
  const [view, setView] = useState<"list" | "calendar">("list");

  useEffect(() => {
    meetingsCrud.fetchAll(mockMeetings).then(setMeetings);
  }, []);

  const upcoming = meetings.filter((m) => !m.summary).sort((a, b) => +new Date(a.scheduledAt) - +new Date(b.scheduledAt));
  const past = meetings.filter((m) => m.summary).sort((a, b) => +new Date(b.scheduledAt) - +new Date(a.scheduledAt));

  return (
    <div className="section-padding py-16 sm:py-24">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <SectionHeading eyebrow="Council & Moderator" title="Meetings" description="Schedules, agendas, and summaries from council and moderator meetings." />
          <div className="flex glass rounded-full p-1 shrink-0">
            <button
              onClick={() => setView("list")}
              className={cn("px-4 py-2 rounded-full text-xs font-mono uppercase flex items-center gap-1.5 cursor-pointer", view === "list" ? "bg-[var(--color-gold)]/15 text-[var(--color-gold-bright)]" : "text-[var(--color-ash)]")}
            >
              <List size={13} /> List
            </button>
            <button
              onClick={() => setView("calendar")}
              className={cn("px-4 py-2 rounded-full text-xs font-mono uppercase flex items-center gap-1.5 cursor-pointer", view === "calendar" ? "bg-[var(--color-gold)]/15 text-[var(--color-gold-bright)]" : "text-[var(--color-ash)]")}
            >
              <LayoutGrid size={13} /> Calendar
            </button>
          </div>
        </div>

        {view === "list" ? (
          <>
            <section className="mt-12">
              <h3 className="font-display text-xl text-[var(--color-ivory)]">Upcoming Schedule</h3>
              <div className="hairline mt-4 mb-8" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {upcoming.map((m) => (
                  <GlassCard key={m.id}>
                    <div className="flex items-center gap-2 text-xs font-mono text-[var(--color-gold-bright)]">
                      <CalendarDays size={14} /> {formatDateTime(m.scheduledAt)}
                    </div>
                    <h4 className="font-display text-lg mt-3 text-[var(--color-ivory)]">{m.title}</h4>
                    <div className="mt-4">
                      <p className="flex items-center gap-2 text-xs text-[var(--color-ash-dim)] font-mono uppercase tracking-wider mb-2">
                        <ListChecks size={13} /> Agenda
                      </p>
                      <ul className="space-y-1.5">
                        {m.agenda.map((item, i) => (
                          <li key={i} className="text-sm text-[var(--color-ash)] flex gap-2">
                            <span className="text-[var(--color-gold)]">•</span> {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </GlassCard>
                ))}
              </div>
            </section>

            <section className="mt-16">
              <h3 className="font-display text-xl text-[var(--color-ivory)]">Previous Meeting Summaries</h3>
              <div className="hairline mt-4 mb-8" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {past.map((m) => (
                  <GlassCard key={m.id}>
                    <Badge>{formatDateTime(m.scheduledAt)}</Badge>
                    <h4 className="font-display text-lg mt-3 text-[var(--color-ivory)]">{m.title}</h4>
                    <p className="mt-2 text-sm text-[var(--color-ash)] leading-relaxed">{m.summary}</p>
                    {m.attachmentUrl && (
                      <a href={m.attachmentUrl} className="mt-4 inline-flex items-center gap-2 text-sm text-[var(--color-gold-bright)] hover:gap-3 transition-all">
                        <FileText size={14} /> {m.attachmentLabel}
                      </a>
                    )}
                  </GlassCard>
                ))}
              </div>
            </section>
          </>
        ) : (
          <MiniCalendar meetings={meetings} />
        )}
      </div>
    </div>
  );
}

function MiniCalendar({ meetings }: { meetings: Meeting[] }) {
  // `today` is resolved client-side only. This page is statically
  // prerendered, so computing "now" directly during render would bake in
  // the build-time date — causing the "today" highlight to mismatch (and
  // React to warn about a hydration mismatch) once the page is actually
  // viewed on a different day.
  const [today, setToday] = useState<Date | null>(null);
  useEffect(() => setToday(new Date()), []);

  const base = today ?? new Date(0); // static fallback used only until mount
  const year = base.getFullYear();
  const month = base.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const meetingDays = new Set(meetings.map((m) => new Date(m.scheduledAt).getDate()));
  const monthLabel = base.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const cells = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  return (
    <GlassCard className="mt-12 max-w-2xl mx-auto" hover={false}>
      <h3 className="font-display text-lg text-center text-[var(--color-ivory)]">{monthLabel}</h3>
      <div className="grid grid-cols-7 gap-1 mt-6 text-center">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <div key={i} className="text-xs text-[var(--color-ash-dim)] font-mono py-2">
            {d}
          </div>
        ))}
        {cells.map((day, i) => (
          <div
            key={i}
            className={cn(
              "aspect-square flex items-center justify-center rounded-lg text-sm",
              day === null && "invisible",
              today && day === today.getDate() && "ring-1 ring-[var(--color-gold)]/50 text-[var(--color-gold-bright)]",
              day && meetingDays.has(day) && "bg-[var(--color-gold)]/15 text-[var(--color-gold-bright)] font-medium"
            )}
          >
            {day}
          </div>
        ))}
      </div>
      <p className="text-xs text-[var(--color-ash-dim)] text-center mt-6 font-mono">Highlighted dates have a scheduled meeting</p>
    </GlassCard>
  );
}
