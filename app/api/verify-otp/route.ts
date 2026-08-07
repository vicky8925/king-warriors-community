import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const MAX_ATTEMPTS = 5;

export async function POST(request: Request) {
  let body: { email?: string; code?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  const code = body.code?.trim();
  if (!email || !code) {
    return NextResponse.json({ error: "Email and code are required." }, { status: 400 });
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Signup verification isn't configured yet." }, { status: 503 });
  }

  // Find the latest pending code for this email, regardless of what was
  // typed — this lets us track and cap wrong attempts against it.
  const { data, error } = await supabaseAdmin
    .from("otp_codes")
    .select("*")
    .eq("email", email)
    .eq("consumed", false)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json({ error: "No pending verification. Please request a new code." }, { status: 400 });
  }

  if (new Date(data.expires_at).getTime() < Date.now()) {
    return NextResponse.json({ error: "This code has expired. Please request a new one." }, { status: 400 });
  }

  if (data.attempts >= MAX_ATTEMPTS) {
    await supabaseAdmin.from("otp_codes").update({ consumed: true }).eq("id", data.id);
    return NextResponse.json(
      { error: "Too many incorrect attempts. Please request a new code." },
      { status: 429 }
    );
  }

  if (data.code !== code) {
    await supabaseAdmin.from("otp_codes").update({ attempts: data.attempts + 1 }).eq("id", data.id);
    const remaining = MAX_ATTEMPTS - (data.attempts + 1);
    return NextResponse.json(
      { error: remaining > 0 ? `Incorrect code. ${remaining} attempt(s) left.` : "Incorrect code." },
      { status: 400 }
    );
  }

  await supabaseAdmin
    .from("otp_codes")
    .update({ consumed: true, verified_at: new Date().toISOString() })
    .eq("id", data.id);

  return NextResponse.json({ success: true });
}
