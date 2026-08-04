"use client";

import { useEffect, useState } from "react";
import { MapPin, Video, Users, ArrowRight } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { GlassCard, Badge } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { CountdownTimer } from "@/components/ui/CountdownTimer";
import { events as mockEvents, eventsCrud } from "@/lib/data/events";
import { formatDateTime, formatDate } from "@/lib/utils";
import { MemberGuard } from "@/components/MemberGuard";
import type { CommunityEvent } from "@/lib/types";

export default function EventsPage() {
  return (
    <MemberGuard>
      <EventsContent />
    </MemberGuard>
  );
}

function EventsContent() {
  const [events, setEvents] = useState<CommunityEvent[]>(mockEvents);
  const [showPast, setShowPast] = useState(false);

  useEffect(() => {
    eventsCrud.fetchAll(mockEvents).then(setEvents);
  }, []);

  const upcoming = events.filter((e) => e.status === "upcoming").sort((a, b) => +new Date(a.startAt) - +new Date(b.startAt));
  const past = events.filter((e) => e.status === "past").sort((a, b) => +new Date(b.startAt) - +new Date(a.startAt));

  return (
    <div className="section-padding py-16 sm:py-24">
      <div className="max-w-6xl mx-auto">
        <SectionHeading eyebrow="Gather & Grow" title="Upcoming Events" description="Bootcamps, live AMAs, and chapter meetups — mark your calendar." />

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          {upcoming.map((e, i) => (
            <GlassCard
              key={e.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className="p-0 overflow-hidden flex flex-col"
            >
              {e.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={e.imageUrl} alt={e.title} className="h-48 w-full object-cover" loading="lazy" />
              )}
              <div className="p-6 flex flex-col flex-1">
                <Badge className="self-start">{e.isOnline ? "Online" : "In Person"}</Badge>
                <h3 className="font-display text-xl mt-3 text-[var(--color-ivory)] leading-snug">{e.title}</h3>
                <p className="mt-2 text-sm text-[var(--color-ash)] leading-relaxed">{e.description}</p>

                <div className="mt-4 space-y-2 text-sm text-[var(--color-ash)]">
                  <div className="flex items-center gap-2">
                    {e.isOnline ? <Video size={14} /> : <MapPin size={14} />}
                    {e.location}
                  </div>
                  <div className="flex items-center gap-2 font-mono text-xs">{formatDateTime(e.startAt)}</div>
                  {e.attendeesCount && (
                    <div className="flex items-center gap-2">
                      <Users size={14} /> {e.attendeesCount} registered
                    </div>
                  )}
                </div>

                <div className="mt-5 flex items-center justify-between gap-4 flex-wrap">
                  <CountdownTimer target={e.startAt} />
                </div>

                <Button className="mt-6 w-full" onClick={() => window.open(e.registerUrl ?? "#", "_blank")}>
                  Register <ArrowRight size={16} />
                </Button>
              </div>
            </GlassCard>
          ))}
        </div>

        {upcoming.length === 0 && (
          <p className="text-center text-[var(--color-ash)] mt-12">No upcoming events right now — check back soon.</p>
        )}

        {/* Past events archive */}
        <div className="mt-20">
          <button
            onClick={() => setShowPast((v) => !v)}
            className="eyebrow flex items-center gap-2 cursor-pointer hover:text-[var(--color-gold)] transition-colors"
          >
            Past Events Archive {showPast ? "−" : "+"}
          </button>
          <div className="hairline mt-4 mb-8" />
          {showPast && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {past.map((e) => (
                <GlassCard key={e.id} hover={false} className="opacity-80">
                  <p className="text-xs text-[var(--color-ash-dim)] font-mono">{formatDate(e.startAt)}</p>
                  <h4 className="font-display text-base mt-2 text-[var(--color-ivory)]">{e.title}</h4>
                  <p className="mt-2 text-sm text-[var(--color-ash)]">{e.location}</p>
                  {e.attendeesCount && (
                    <p className="mt-3 text-xs text-[var(--color-gold-bright)] font-mono">{e.attendeesCount} attended</p>
                  )}
                </GlassCard>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
