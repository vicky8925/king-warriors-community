"use client";

import { useEffect, useState } from "react";
import { Users, UserCheck, CalendarClock, Trophy, Megaphone, Images } from "lucide-react";
import { DashboardWidget } from "@/components/admin/DashboardWidget";
import { GlassCard } from "@/components/ui/GlassCard";
import { useAuth } from "@/lib/auth";
import { dashboardStats } from "@/lib/data/stats";
import { updates as mockUpdates, updatesCrud } from "@/lib/data/updates";
import { events as mockEvents, eventsCrud } from "@/lib/data/events";
import { winners as mockWinners, winnersCrud } from "@/lib/data/winners";
import { gallery as mockGallery, galleryVideos, galleryCrud } from "@/lib/data/gallery";
import { formatDate } from "@/lib/utils";
import type { DailyUpdate, CommunityEvent, Winner, GalleryItem } from "@/lib/types";

const mockGalleryAll = [...mockGallery, ...galleryVideos];

export default function DashboardOverviewPage() {
  const user = useAuth((s) => s.user);
  const [updates, setUpdates] = useState<DailyUpdate[]>(mockUpdates);
  const [events, setEvents] = useState<CommunityEvent[]>(mockEvents);
  const [winners, setWinners] = useState<Winner[]>(mockWinners);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>(mockGalleryAll);

  useEffect(() => {
    updatesCrud.fetchAll(mockUpdates).then(setUpdates);
    eventsCrud.fetchAll(mockEvents).then(setEvents);
    winnersCrud.fetchAll(mockWinners).then(setWinners);
    galleryCrud.fetchAll(mockGalleryAll).then(setGalleryItems);
  }, []);

  const upcomingEvent = events.find((e) => e.status === "upcoming");

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-2xl text-[var(--color-ivory)]">Welcome back, {user?.name?.split(" ")[0]}</h1>
          <p className="text-sm text-[var(--color-ash)] mt-1">Here&apos;s what&apos;s happening across King Warriors Community.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
        <DashboardWidget icon={Users} label="Total Members" value={dashboardStats.totalMembers.toLocaleString()} trend="+3.2% this month" />
        <DashboardWidget icon={UserCheck} label="Active Members" value={dashboardStats.activeMembers.toLocaleString()} />
        <DashboardWidget icon={CalendarClock} label="Total Events" value={events.length} />
        <DashboardWidget icon={Trophy} label="Total Winners" value={winners.length} />
        <DashboardWidget icon={Megaphone} label="Total Updates" value={updates.length} />
        <DashboardWidget icon={Images} label="Gallery Count" value={galleryItems.length} />
      </div>

      <p className="text-xs text-[var(--color-ash-dim)] mt-3">
        Member counts are set manually below (no membership/sign-up system yet) — everything else updates live from your data.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-10">
        <GlassCard hover={false}>
          <p className="eyebrow mb-4">Recent Announcements</p>
          <div className="space-y-3">
            {updates.slice(0, 4).map((u) => (
              <div key={u.id} className="flex items-center justify-between gap-3 pb-3 border-b border-[var(--color-hairline)] last:border-0 last:pb-0">
                <p className="text-sm text-[var(--color-ivory)] truncate">{u.title}</p>
                <span className="text-xs text-[var(--color-ash-dim)] font-mono shrink-0">{formatDate(u.createdAt)}</span>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard hover={false}>
          <p className="eyebrow mb-4">Next Upcoming Event</p>
          {upcomingEvent ? (
            <>
              <p className="font-display text-lg text-[var(--color-ivory)]">{upcomingEvent.title}</p>
              <p className="text-sm text-[var(--color-ash)] mt-1">{upcomingEvent.location}</p>
              <p className="text-xs text-[var(--color-gold-bright)] font-mono mt-3">{formatDate(upcomingEvent.startAt)}</p>
            </>
          ) : (
            <p className="text-sm text-[var(--color-ash)]">No upcoming events scheduled.</p>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
