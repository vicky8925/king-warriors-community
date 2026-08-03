import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

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

  const { data, error } = await supabaseAdmin
    .from("otp_codes")
    .select("*")
    .eq("email", email)
    .eq("code", code)
    .eq("consumed", false)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json({ error: "Incorrect code. Please check and try again." }, { status: 400 });
  }

  if (new Date(data.expires_at).getTime() < Date.now()) {
    return NextResponse.json({ error: "This code has expired. Please request a new one." }, { status: 400 });
  }

  await supabaseAdmin
    .from("otp_codes")
    .update({ consumed: true, verified_at: new Date().toISOString() })
    .eq("id", data.id);

  return NextResponse.json({ success: true });
}
