import type { Meeting } from "@/lib/types";
import { createCrud } from "@/lib/supabaseCrud";

interface MeetingRow {
  id: string;
  title: string;
  agenda: string[] | null;
  scheduled_at: string;
  summary: string | null;
  attachment_url: string | null;
  attachment_label: string | null;
}

function fromRow(row: MeetingRow): Meeting {
  return {
    id: row.id,
    title: row.title,
    agenda: row.agenda ?? [],
    scheduledAt: row.scheduled_at,
    summary: row.summary ?? undefined,
    attachmentUrl: row.attachment_url ?? undefined,
    attachmentLabel: row.attachment_label ?? undefined,
  };
}

function toRow(item: Partial<Meeting>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (item.title !== undefined) row.title = item.title;
  if (item.agenda !== undefined) row.agenda = item.agenda;
  if (item.scheduledAt !== undefined) row.scheduled_at = item.scheduledAt;
  if (item.summary !== undefined) row.summary = item.summary || null;
  if (item.attachmentUrl !== undefined) row.attachment_url = item.attachmentUrl || null;
  if (item.attachmentLabel !== undefined) row.attachment_label = item.attachmentLabel || null;
  return row;
}

export const meetingsCrud = createCrud<Meeting, MeetingRow>("meetings", toRow, fromRow, {
  column: "scheduled_at",
  ascending: true,
});

// Seed / fallback data — used directly when Supabase isn't configured yet.
export const meetings: Meeting[] = [
  {
    id: "m1",
    title: "Council Meeting — Growth Strategy",
    agenda: [
      "Review Q3 membership growth targets",
      "New chapter proposals (2 pending)",
      "Mentorship program budget approval",
      "Open floor",
    ],
    scheduledAt: "2026-07-25T13:00:00.000Z",
  },
  {
    id: "m2",
    title: "Moderator Sync",
    agenda: ["Community guideline edge cases", "Upcoming AMA moderation plan", "Reward eligibility disputes"],
    scheduledAt: "2026-07-28T10:00:00.000Z",
  },
  {
    id: "m3",
    title: "Council Meeting — Event Planning",
    agenda: [
      "August Leadership Bootcamp logistics",
      "Coimbatore chapter launch checklist",
      "Vendor and venue confirmations",
    ],
    scheduledAt: "2026-07-08T13:00:00.000Z",
    summary:
      "Approved the venue for the August Bootcamp and finalized the Coimbatore launch date. Budget for both events confirmed within Q3 allocation.",
    attachmentUrl: "#",
    attachmentLabel: "Meeting minutes.pdf",
  },
  {
    id: "m4",
    title: "Council Meeting — Q2 Review",
    agenda: ["Q2 growth review", "Reward budget review", "Founder's remarks"],
    scheduledAt: "2026-06-15T13:00:00.000Z",
    summary:
      "Q2 closed with 18% membership growth quarter-over-quarter. Reward budget increased by 15% for Q3 based on engagement metrics.",
    attachmentUrl: "#",
    attachmentLabel: "Q2 summary.pdf",
  },
];
