import type { CommunityEvent } from "@/lib/types";
import { createCrud } from "@/lib/supabaseCrud";

interface EventRow {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  location: string;
  is_online: boolean;
  start_at: string;
  end_at: string | null;
  register_url: string | null;
  status: string;
  attendees_count: number | null;
}

function fromRow(row: EventRow): CommunityEvent {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    imageUrl: row.image_url ?? undefined,
    location: row.location,
    isOnline: row.is_online,
    startAt: row.start_at,
    endAt: row.end_at ?? undefined,
    registerUrl: row.register_url ?? undefined,
    status: row.status as CommunityEvent["status"],
    attendeesCount: row.attendees_count ?? undefined,
  };
}

function toRow(item: Partial<CommunityEvent>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (item.title !== undefined) row.title = item.title;
  if (item.description !== undefined) row.description = item.description;
  if (item.imageUrl !== undefined) row.image_url = item.imageUrl || null;
  if (item.location !== undefined) row.location = item.location;
  if (item.isOnline !== undefined) row.is_online = item.isOnline;
  if (item.startAt !== undefined) row.start_at = item.startAt;
  if (item.endAt !== undefined) row.end_at = item.endAt || null;
  if (item.registerUrl !== undefined) row.register_url = item.registerUrl || null;
  if (item.status !== undefined) row.status = item.status;
  if (item.attendeesCount !== undefined) row.attendees_count = item.attendeesCount;
  return row;
}

export const eventsCrud = createCrud<CommunityEvent, EventRow>("events", toRow, fromRow, {
  column: "start_at",
  ascending: true,
});

// Seed / fallback data — used directly when Supabase isn't configured yet.
export const events: CommunityEvent[] = [
  {
    id: "e1",
    title: "August Leadership Bootcamp",
    description: "A full-day intensive on discipline, public speaking, and team leadership led by senior warriors.",
    imageUrl: "https://picsum.photos/seed/kw-bootcamp/1200/700",
    location: "Chennai Trade Centre, Hall B",
    isOnline: false,
    startAt: "2026-08-15T09:00:00.000Z",
    endAt: "2026-08-15T17:00:00.000Z",
    registerUrl: "#",
    status: "upcoming",
    attendeesCount: 212,
  },
  {
    id: "e2",
    title: "Warriors Live: Building Discipline",
    description: "Monthly online AMA with the founding council on building unshakeable daily discipline.",
    isOnline: true,
    location: "Online — Zoom",
    startAt: "2026-08-02T14:30:00.000Z",
    registerUrl: "#",
    status: "upcoming",
    attendeesCount: 540,
  },
  {
    id: "e3",
    title: "Chapter Meetup — Coimbatore Launch",
    description: "Celebrating the launch of our newest chapter with a members-only meetup and networking dinner.",
    imageUrl: "https://picsum.photos/seed/kw-coimbatore/1200/700",
    location: "Vivanta Coimbatore",
    isOnline: false,
    startAt: "2026-08-22T12:00:00.000Z",
    registerUrl: "#",
    status: "upcoming",
    attendeesCount: 96,
  },
  {
    id: "e4",
    title: "July Leadership Summit",
    description: "Our biggest offline summit yet — six chapters, one stage, a full day of workshops and panels.",
    imageUrl: "https://picsum.photos/seed/kw-summit/1200/700",
    location: "ITC Grand Chola, Chennai",
    isOnline: false,
    startAt: "2026-07-10T09:00:00.000Z",
    endAt: "2026-07-10T18:00:00.000Z",
    status: "past",
    attendeesCount: 412,
  },
  {
    id: "e5",
    title: "Warriors Live: Q2 Town Hall",
    description: "Quarterly town hall covering community growth, upcoming initiatives, and open Q&A.",
    isOnline: true,
    location: "Online — Zoom",
    startAt: "2026-06-20T14:30:00.000Z",
    status: "past",
    attendeesCount: 601,
  },
];
