import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export interface SiteSettings {
  maintenanceMode: boolean;
  maintenanceMessage: string;
}

export const defaultSiteSettings: SiteSettings = {
  maintenanceMode: false,
  maintenanceMessage:
    "We'll be back shortly. King Warriors Community is undergoing scheduled maintenance — thank you for your patience.",
};

/** Reads the single settings row. Falls back to defaults in mock mode or if the row doesn't exist yet. */
export async function fetchSiteSettings(): Promise<SiteSettings> {
  if (!isSupabaseConfigured || !supabase) return defaultSiteSettings;
  const { data, error } = await supabase.from("site_settings").select("*").eq("id", 1).single();
  if (error || !data) return defaultSiteSettings;
  return {
    maintenanceMode: Boolean(data.maintenance_mode),
    maintenanceMessage: data.maintenance_message ?? defaultSiteSettings.maintenanceMessage,
  };
}

/** Updates the settings row. Returns false (no-op) in mock mode. */
export async function updateSiteSettings(settings: Partial<SiteSettings>): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;
  const row: Record<string, unknown> = {};
  if (settings.maintenanceMode !== undefined) row.maintenance_mode = settings.maintenanceMode;
  if (settings.maintenanceMessage !== undefined) row.maintenance_message = settings.maintenanceMessage;
  const { error } = await supabase.from("site_settings").update(row).eq("id", 1);
  if (error) {
    console.error("[site_settings] update failed:", error.message);
    return false;
  }
  return true;
}
