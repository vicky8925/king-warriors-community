"use client";

import { useEffect, useState } from "react";
import { StatCard } from "@/components/ui/StatCard";
import { homeStats } from "@/lib/data/stats";
import { events as mockEvents, eventsCrud } from "@/lib/data/events";
import { winners as mockWinners, winnersCrud } from "@/lib/data/winners";

export function StatsSection() {
  const [eventsCount, setEventsCount] = useState(mockEvents.length);
  const [winnersCount, setWinnersCount] = useState(mockWinners.length);

  useEffect(() => {
    eventsCrud.fetchAll(mockEvents).then((data) => setEventsCount(data.length));
    winnersCrud.fetchAll(mockWinners).then((data) => setWinnersCount(data.length));
  }, []);

  // "Members" and "Chapters" are set manually in lib/data/stats.ts (no
  // membership system yet). "Events Hosted" and "Rewards Given" reflect the
  // live counts from the Events and Winners tables.
  const stats = homeStats.map((s) => {
    if (s.label === "Events Hosted") return { ...s, value: eventsCount };
    if (s.label === "Rewards Given") return { ...s, value: winnersCount };
    return s;
  });

  return (
    <section className="section-padding py-16 sm:py-20">
      <div className="max-w-6xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((s, i) => (
          <StatCard key={s.label} label={s.label} value={s.value} suffix={s.suffix} index={i} />
        ))}
      </div>
    </section>
  );
}
