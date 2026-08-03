import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

/**
 * Server-only Supabase client using the SECRET service role key, which
 * bypasses Row Level Security entirely. This must only ever be imported
 * inside `app/api/*` route handlers (server code) — never inside a "use
 * client" component, and the env var must NOT have the NEXT_PUBLIC_ prefix,
 * or it would be bundled into the browser and exposed publicly.
 *
 * It's used specifically for the OTP email-verification flow: the
 * `otp_codes` table intentionally has no RLS policies at all, so the only
 * way to read/write it is through this admin client on the server.
 */
export const supabaseAdmin =
  supabaseUrl && serviceRoleKey
    ? createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } })
    : null;
