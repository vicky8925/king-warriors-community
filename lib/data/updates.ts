import type { DailyUpdate } from "@/lib/types";
import { createCrud } from "@/lib/supabaseCrud";

interface UpdateRow {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  image_url: string | null;
  video_url: string | null;
  author: string;
  author_avatar_url: string | null;
  pinned: boolean | null;
  created_at: string;
}

function fromRow(row: UpdateRow): DailyUpdate {
  return {
    id: row.id,
    title: row.title,
    excerpt: row.excerpt,
    content: row.content,
    category: row.category as DailyUpdate["category"],
    imageUrl: row.image_url ?? undefined,
    videoUrl: row.video_url ?? undefined,
    author: row.author,
    authorAvatarUrl: row.author_avatar_url ?? undefined,
    pinned: row.pinned ?? false,
    createdAt: row.created_at,
  };
}

function toRow(item: Partial<DailyUpdate>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (item.title !== undefined) row.title = item.title;
  if (item.excerpt !== undefined) row.excerpt = item.excerpt;
  if (item.content !== undefined) row.content = item.content;
  if (item.category !== undefined) row.category = item.category;
  if (item.imageUrl !== undefined) row.image_url = item.imageUrl || null;
  if (item.videoUrl !== undefined) row.video_url = item.videoUrl || null;
  if (item.author !== undefined) row.author = item.author;
  if (item.authorAvatarUrl !== undefined) row.author_avatar_url = item.authorAvatarUrl || null;
  if (item.pinned !== undefined) row.pinned = item.pinned;
  return row;
}

export const updatesCrud = createCrud<DailyUpdate, UpdateRow>("daily_updates", toRow, fromRow, {
  column: "created_at",
  ascending: false,
});

// Seed / fallback data — used directly when Supabase isn't configured yet.
export const updates: DailyUpdate[] = [
  {
    id: "u1",
    title: "King Warriors crosses 10,000 members",
    excerpt: "A milestone ten thousand strong — thank you to every warrior who showed up, showed out, and brought a friend.",
    content:
      "Today the community officially crossed ten thousand members. What began as a small circle of twelve has grown into one of the most active leadership communities in the region. The founding team is planning a members-only celebration event next month — details will be announced here first.",
    category: "announcement",
    imageUrl: "https://picsum.photos/seed/kw-milestone/1200/800",
    author: "Aarav Sharma",
    authorAvatarUrl: "https://i.pravatar.cc/100?img=12",
    createdAt: "2026-07-18T09:00:00.000Z",
    pinned: true,
  },
  {
    id: "u2",
    title: "New mentorship track opens for applications",
    excerpt: "Six-week structured mentorship pairing senior warriors with new members. Applications close Friday.",
    content:
      "The mentorship committee has opened applications for the third cohort of the King Warriors Mentorship Track. Selected members will be paired with a senior warrior for six weeks of structured 1:1 guidance covering leadership, discipline, and community building.",
    category: "news",
    imageUrl: "https://picsum.photos/seed/kw-mentorship/1200/800",
    author: "Diya Kapoor",
    authorAvatarUrl: "https://i.pravatar.cc/100?img=32",
    createdAt: "2026-07-15T09:00:00.000Z",
  },
  {
    id: "u3",
    title: "Recap: July Leadership Summit",
    excerpt: "Over 400 members joined our biggest offline summit yet. Here's what happened.",
    content:
      "The July Leadership Summit brought together warriors from six chapters for a full day of workshops, panel discussions, and networking. Highlights included the keynote on discipline-driven leadership and the surprise announcement of the new chapter in Coimbatore.",
    category: "event-recap",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    author: "Rohan Mehta",
    authorAvatarUrl: "https://i.pravatar.cc/100?img=15",
    createdAt: "2026-07-10T09:00:00.000Z",
  },
  {
    id: "u4",
    title: "Warrior of the Month: Priya Nair",
    excerpt: "Recognized for outstanding contribution to onboarding and member support this quarter.",
    content:
      "Priya has personally onboarded over 120 new members and runs the weekly welcome circle. The council recognized her consistency and warmth as exactly what the community stands for.",
    category: "achievement",
    imageUrl: "https://picsum.photos/seed/kw-warrior-month/1200/800",
    author: "Council",
    createdAt: "2026-07-05T09:00:00.000Z",
  },
  {
    id: "u5",
    title: "Updated community guidelines now live",
    excerpt: "Small but important updates to conduct expectations — please review before next week's meeting.",
    content:
      "Following member feedback, the council has refined three sections of the community guidelines relating to respectful discourse, event conduct, and reward eligibility. Read the full rules on the Community Rules page.",
    category: "general",
    author: "Council",
    createdAt: "2026-06-29T09:00:00.000Z",
  },
];
