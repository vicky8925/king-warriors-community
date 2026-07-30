import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Runs on every request except the ones excluded in `matcher` below
// (admin routes, the maintenance page itself, and static assets — so
// admins can always reach /admin/login to switch maintenance mode off).
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.svg|admin|maintenance|api).*)"],
};

export async function proxy(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Mock mode (no Supabase configured) — maintenance mode isn't available.
  if (!supabaseUrl || !supabaseKey) return NextResponse.next();

  try {
    const res = await fetch(
      `${supabaseUrl}/rest/v1/site_settings?select=maintenance_mode&id=eq.1`,
      {
        headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` },
        cache: "no-store",
      }
    );
    if (!res.ok) return NextResponse.next();
    const rows: { maintenance_mode: boolean }[] = await res.json();
    const isMaintenance = rows?.[0]?.maintenance_mode === true;

    if (isMaintenance) {
      const url = request.nextUrl.clone();
      url.pathname = "/maintenance";
      return NextResponse.rewrite(url);
    }
  } catch {
    // If the settings check fails for any reason, fail open (show the real site).
    return NextResponse.next();
  }

  return NextResponse.next();
}
