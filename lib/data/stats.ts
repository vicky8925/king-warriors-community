import type { DashboardStats } from "@/lib/types";

export const dashboardStats: DashboardStats = {
  totalMembers: 7000,
  activeMembers: 5500,
  totalEvents: 1020,
  totalWinners: 507,
  totalUpdates: 87,
  galleryCount: 0,
};

export const homeStats = [
  { label: "Members", value: 7000, suffix: "+" },
  { label: "Chapters", value: 170, suffix: "" },
  { label: "Events Hosted", value: 1020, suffix: "" },
  { label: "Rewards Given", value: 507, suffix: "" },
];
