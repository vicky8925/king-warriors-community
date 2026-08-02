import { supabase } from "@/lib/supabase";

/**
 * Uploads a file to the "gallery" storage bucket under the given folder
 * prefix (e.g. "team", "winners", "events") and returns its public URL, or
 * null if the upload failed (an error toast should be shown by the caller).
 */
export async function uploadImage(file: File, folder: string): Promise<string | null> {
  if (!supabase) return null;
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage.from("gallery").upload(path, file);
  if (error) {
    console.error(`[upload] ${folder} upload failed:`, error.message);
    return null;
  }
  return supabase.storage.from("gallery").getPublicUrl(path).data.publicUrl;
}
