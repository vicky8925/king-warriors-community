import type { Winner } from "@/lib/types";
import { createCrud } from "@/lib/supabaseCrud";

interface WinnerRow {
  id: string;
  name: string;
  photo_url: string;
  tier: string;
  reward: string;
  achievement: string;
  badge: string;
  period_label: string;
  date: string;
}

function fromRow(row: WinnerRow): Winner {
  return {
    id: row.id,
    name: row.name,
    photoUrl: row.photo_url,
    tier: row.tier as Winner["tier"],
    reward: row.reward,
    achievement: row.achievement,
    badge: row.badge,
    periodLabel: row.period_label,
    date: row.date,
  };
}

function toRow(item: Partial<Winner>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (item.name !== undefined) row.name = item.name;
  if (item.photoUrl !== undefined) row.photo_url = item.photoUrl;
  if (item.tier !== undefined) row.tier = item.tier;
  if (item.reward !== undefined) row.reward = item.reward;
  if (item.achievement !== undefined) row.achievement = item.achievement;
  if (item.badge !== undefined) row.badge = item.badge;
  if (item.periodLabel !== undefined) row.period_label = item.periodLabel;
  return row;
}

export const winnersCrud = createCrud<Winner, WinnerRow>("winners", toRow, fromRow, {
  column: "date",
  ascending: false,
});

// Seed / fallback data — used directly when Supabase isn't configured yet.
export const winners: Winner[] = [
  {
    id: "w1",
    name: "Priya Nair",
    photoUrl: "https://i.pravatar.cc/300?img=47",
    tier: "weekly",
    reward: "₹2,000 + Gold Badge",
    achievement: "Most new member referrals this week",
    badge: "Top Recruiter",
    periodLabel: "Week 29, 2026",
    date: "2026-07-19",
  },
  {
    id: "w2",
    name: "Arjun Verma",
    photoUrl: "https://i.pravatar.cc/300?img=51",
    tier: "weekly",
    reward: "₹1,000 + Gold Badge",
    achievement: "Highest engagement in daily discussions",
    badge: "Most Engaged",
    periodLabel: "Week 29, 2026",
    date: "2026-07-19",
  },
  {
    id: "w3",
    name: "Sneha Iyer",
    photoUrl: "https://i.pravatar.cc/300?img=44",
    tier: "monthly",
    reward: "₹10,000 + Trophy",
    achievement: "Organized 4 community events single-handedly",
    badge: "Event Champion",
    periodLabel: "June 2026",
    date: "2026-07-01",
  },
  {
    id: "w4",
    name: "Kabir Singh",
    photoUrl: "https://i.pravatar.cc/300?img=13",
    tier: "monthly",
    reward: "₹10,000 + Trophy",
    achievement: "Mentored 8 new warriors to full onboarding",
    badge: "Mentor of the Month",
    periodLabel: "June 2026",
    date: "2026-07-01",
  },
  {
    id: "w5",
    name: "Aarav Sharma",
    photoUrl: "https://i.pravatar.cc/300?img=12",
    tier: "hall-of-fame",
    reward: "Lifetime Founder Status",
    achievement: "Founding member — built the community from 12 to 10,000+",
    badge: "Founder's Legacy",
    periodLabel: "All-time",
    date: "2024-01-10",
  },
  {
    id: "w6",
    name: "Diya Kapoor",
    photoUrl: "https://i.pravatar.cc/300?img=32",
    tier: "hall-of-fame",
    reward: "Lifetime Recognition",
    achievement: "Ran the mentorship program for two consecutive years",
    badge: "Pillar of the Community",
    periodLabel: "All-time",
    date: "2024-08-22",
  },
];
