import type { DashboardStats } from "@/lib/types";

export const dashboardStats: DashboardStats = {
  totalMembers: 10248,
  activeMembers: 6890,
  totalEvents: 34,
  totalWinners: 128,
  totalUpdates: 96,
  galleryCount: 214,
};

export const homeStats = [
  { label: "Members", value: 10248, suffix: "+" },
  { label: "Chapters", value: 12, suffix: "" },
  { label: "Events Hosted", value: 34, suffix: "" },
  { label: "Rewards Given", value: 128, suffix: "" },
];
