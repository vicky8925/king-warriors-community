import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export interface SiteSettings {
  maintenanceMode: boolean;
  maintenanceMessage: string;
  totalMembers: number;
  activeMembers: number;
  chapters: number;
}

export const defaultSiteSettings: SiteSettings = {
  maintenanceMode: false,
  maintenanceMessage:
    "We'll be back shortly. King Warriors Community is undergoing scheduled maintenance — thank you for your patience.",
  totalMembers: 10248,
  activeMembers: 6890,
  chapters: 12,
};

/** Reads the single settings row. Falls back to defaults in mock mode or if the row doesn't exist yet. */
export async function fetchSiteSettings(): Promise<SiteSettings> {
  if (!isSupabaseConfigured || !supabase) return defaultSiteSettings;
  const { data, error } = await supabase.from("site_settings").select("*").eq("id", 1).single();
  if (error || !data) return defaultSiteSettings;
  return {
    maintenanceMode: Boolean(data.maintenance_mode),
    maintenanceMessage: data.maintenance_message ?? defaultSiteSettings.maintenanceMessage,
    totalMembers: data.total_members ?? defaultSiteSettings.totalMembers,
    activeMembers: data.active_members ?? defaultSiteSettings.activeMembers,
    chapters: data.chapters ?? defaultSiteSettings.chapters,
  };
}

/** Updates the settings row. Returns false (no-op) in mock mode. */
export async function updateSiteSettings(settings: Partial<SiteSettings>): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;
  const row: Record<string, unknown> = {};
  if (settings.maintenanceMode !== undefined) row.maintenance_mode = settings.maintenanceMode;
  if (settings.maintenanceMessage !== undefined) row.maintenance_message = settings.maintenanceMessage;
  if (settings.totalMembers !== undefined) row.total_members = settings.totalMembers;
  if (settings.activeMembers !== undefined) row.active_members = settings.activeMembers;
  if (settings.chapters !== undefined) row.chapters = settings.chapters;
  const { error } = await supabase.from("site_settings").update(row).eq("id", 1);
  if (error) {
    console.error("[site_settings] update failed:", error.message);
    return false;
  }
  return true;
}
