import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/**
 * Whether real Supabase credentials are configured.
 * When false, the app runs entirely on the mock data in `lib/data/*`
 * so the site is fully browsable out of the box. Once you add your
 * Supabase project's URL + anon key to `.env.local`, every page that
 * reads through `lib/data/*` helpers will automatically start hitting
 * the real database instead — no component code needs to change.
 */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: true, autoRefreshToken: true },
    })
  : null;
