import type { TeamMember } from "@/lib/types";
import { createCrud } from "@/lib/supabaseCrud";

interface TeamRow {
  id: string;
  name: string;
  role: string;
  title: string;
  photo_url: string;
  bio: string;
  socials: { platform: string; url: string }[] | null;
}

function fromRow(row: TeamRow): TeamMember {
  return {
    id: row.id,
    name: row.name,
    role: row.role as TeamMember["role"],
    title: row.title,
    photoUrl: row.photo_url,
    bio: row.bio,
    socials: row.socials ?? undefined,
  };
}

function toRow(item: Partial<TeamMember>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (item.name !== undefined) row.name = item.name;
  if (item.role !== undefined) row.role = item.role;
  if (item.title !== undefined) row.title = item.title;
  if (item.photoUrl !== undefined) row.photo_url = item.photoUrl;
  if (item.bio !== undefined) row.bio = item.bio;
  if (item.socials !== undefined) row.socials = item.socials;
  return row;
}

export const teamCrud = createCrud<TeamMember, TeamRow>("team_members", toRow, fromRow);

// Seed / fallback data — used directly when Supabase isn't configured yet.
export const team: TeamMember[] = [
  {
    id: "t1",
    name: "Aarav Sharma",
    role: "Founder",
    title: "Founder & Chief Warrior",
    photoUrl: "https://i.pravatar.cc/400?img=12",
    bio: "Started King Warriors in 2024 with twelve members and a shared belief in disciplined, collective growth.",
    socials: [
      { platform: "Instagram", url: "#" },
      { platform: "LinkedIn", url: "#" },
    ],
  },
  {
    id: "t2",
    name: "Diya Kapoor",
    role: "Admin",
    title: "Head of Community Operations",
    photoUrl: "https://i.pravatar.cc/400?img=32",
    bio: "Oversees day-to-day operations, mentorship programs, and member support across all chapters.",
    socials: [{ platform: "Instagram", url: "#" }],
  },
  {
    id: "t3",
    name: "Rohan Mehta",
    role: "Admin",
    title: "Head of Events",
    photoUrl: "https://i.pravatar.cc/400?img=15",
    bio: "Plans and runs every offline summit, bootcamp, and chapter launch from the ground up.",
    socials: [{ platform: "LinkedIn", url: "#" }],
  },
  {
    id: "t4",
    name: "Sneha Iyer",
    role: "Moderator",
    title: "Lead Moderator",
    photoUrl: "https://i.pravatar.cc/400?img=44",
    bio: "Keeps daily discussions constructive and ensures the community guidelines are upheld fairly.",
  },
  {
    id: "t5",
    name: "Kabir Singh",
    role: "Moderator",
    title: "Onboarding Moderator",
    photoUrl: "https://i.pravatar.cc/400?img=13",
    bio: "Welcomes every new warrior personally and runs the weekly onboarding circle.",
  },
  {
    id: "t6",
    name: "Priya Nair",
    role: "Moderator",
    title: "Content Moderator",
    photoUrl: "https://i.pravatar.cc/400?img=47",
    bio: "Curates daily updates and manages the announcements members see first.",
  },
];
