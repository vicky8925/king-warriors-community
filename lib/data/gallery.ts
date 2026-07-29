import type { GalleryItem } from "@/lib/types";
import { createCrud } from "@/lib/supabaseCrud";

interface GalleryRow {
  id: string;
  type: string;
  url: string;
  thumbnail_url: string | null;
  caption: string;
  category: string;
  width: number;
  height: number;
  created_at: string;
}

function fromRow(row: GalleryRow): GalleryItem {
  return {
    id: row.id,
    type: row.type as GalleryItem["type"],
    url: row.url,
    thumbnailUrl: row.thumbnail_url ?? undefined,
    caption: row.caption,
    category: row.category,
    createdAt: row.created_at,
    width: row.width,
    height: row.height,
  };
}

function toRow(item: Partial<GalleryItem>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (item.type !== undefined) row.type = item.type;
  if (item.url !== undefined) row.url = item.url;
  if (item.thumbnailUrl !== undefined) row.thumbnail_url = item.thumbnailUrl || null;
  if (item.caption !== undefined) row.caption = item.caption;
  if (item.category !== undefined) row.category = item.category;
  if (item.width !== undefined) row.width = item.width;
  if (item.height !== undefined) row.height = item.height;
  return row;
}

export const galleryCrud = createCrud<GalleryItem, GalleryRow>("gallery_items", toRow, fromRow, {
  column: "created_at",
  ascending: false,
});

const seeds = [
  { seed: "kw-g1", w: 900, h: 1200, cat: "Summits" },
  { seed: "kw-g2", w: 1200, h: 800, cat: "Meetups" },
  { seed: "kw-g3", w: 900, h: 900, cat: "Awards" },
  { seed: "kw-g4", w: 1200, h: 750, cat: "Summits" },
  { seed: "kw-g5", w: 800, h: 1100, cat: "Workshops" },
  { seed: "kw-g6", w: 1200, h: 800, cat: "Meetups" },
  { seed: "kw-g7", w: 1000, h: 1300, cat: "Awards" },
  { seed: "kw-g8", w: 1200, h: 700, cat: "Workshops" },
  { seed: "kw-g9", w: 900, h: 1200, cat: "Summits" },
];

export const gallery: GalleryItem[] = seeds.map((s, i) => ({
  id: `g${i + 1}`,
  type: "photo",
  url: `https://picsum.photos/seed/${s.seed}/${s.w}/${s.h}`,
  thumbnailUrl: `https://picsum.photos/seed/${s.seed}/${Math.round(s.w / 2)}/${Math.round(s.h / 2)}`,
  caption: `${s.cat} — moment ${i + 1}`,
  category: s.cat,
  createdAt: `2026-0${(i % 6) + 2}-1${i}T10:00:00.000Z`,
  width: s.w,
  height: s.h,
}));

export const galleryVideos: GalleryItem[] = [
  {
    id: "gv1",
    type: "video",
    url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    thumbnailUrl: "https://picsum.photos/seed/kw-video1/800/450",
    caption: "July Leadership Summit — highlights reel",
    category: "Summits",
    createdAt: "2026-07-11T10:00:00.000Z",
    width: 16,
    height: 9,
  },
];
