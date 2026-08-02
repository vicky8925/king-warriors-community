// ============================================================
// KING WARRIORS COMMUNITY — SHARED TYPES
// These mirror the Supabase table shapes (see /supabase/schema.sql)
// ============================================================

export type UUID = string;

export type AdminRole = "founder" | "admin" | "moderator";

export interface AdminUser {
  id: UUID;
  email: string;
  name: string;
  role: AdminRole;
  avatarUrl?: string;
}

export type UpdateCategory = "announcement" | "news" | "event-recap" | "achievement" | "general";

export interface DailyUpdate {
  id: UUID;
  title: string;
  excerpt: string;
  content: string;
  category: UpdateCategory;
  imageUrl?: string;
  videoUrl?: string;
  author: string;
  authorAvatarUrl?: string;
  createdAt: string; // ISO date
  pinned?: boolean;
}

export type WinnerTier = "weekly" | "monthly" | "hall-of-fame";

export interface Winner {
  id: UUID;
  name: string;
  photoUrl: string;
  tier: WinnerTier;
  reward: string;
  achievement: string;
  badge: string; // badge label e.g. "Top Recruiter"
  periodLabel: string; // e.g. "Week 28, 2026"
  date: string; // ISO
}

export type EventStatus = "upcoming" | "past";

export interface CommunityEvent {
  id: UUID;
  title: string;
  description: string;
  imageUrl?: string;
  location: string;
  isOnline: boolean;
  startAt: string; // ISO datetime
  endAt?: string;
  registerUrl?: string;
  status: EventStatus;
  attendeesCount?: number;
}

export interface Meeting {
  id: UUID;
  title: string;
  agenda: string[];
  scheduledAt: string; // ISO datetime
  summary?: string; // filled in after meeting happens
  attachmentUrl?: string;
  attachmentLabel?: string;
  registerUrl?: string;
}

export type GalleryMediaType = "photo" | "video";

export interface GalleryItem {
  id: UUID;
  type: GalleryMediaType;
  url: string;
  thumbnailUrl?: string;
  caption: string;
  category: string;
  createdAt: string;
  width: number;
  height: number;
}

export type TeamRole = "Founder" | "Admin" | "Moderator";

export interface TeamMember {
  id: UUID;
  name: string;
  role: TeamRole;
  title: string;
  photoUrl: string;
  bio: string;
  socials?: { platform: string; url: string }[];
}

export interface CommunityRule {
  id: UUID;
  order: number;
  title: string;
  description: string;
}

export interface FAQItem {
  id: UUID;
  question: string;
  answer: string;
}

export interface DashboardStats {
  totalMembers: number;
  activeMembers: number;
  totalEvents: number;
  totalWinners: number;
  totalUpdates: number;
  galleryCount: number;
}

export interface ContactFormValues {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface Member {
  id: UUID;
  name: string;
  email: string;
  phone?: string;
  whyJoin?: string;
  joinedAt: string; // ISO date
}
