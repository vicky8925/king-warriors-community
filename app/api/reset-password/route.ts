import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const OTP_VALIDITY_WINDOW_MS = 30 * 60 * 1000; // must have verified within the last 30 minutes

export async function POST(request: Request) {
  let body: { email?: string; newPassword?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  const newPassword = body.newPassword ?? "";

  if (!email) {
    return NextResponse.json({ error: "Email is required." }, { status: 400 });
  }
  if (newPassword.length < 6) {
    return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Password reset isn't configured yet." }, { status: 503 });
  }

  // Require a recently-verified OTP for this email (via /api/verify-otp).
  const { data: otpRow } = await supabaseAdmin
    .from("otp_codes")
    .select("verified_at")
    .eq("email", email)
    .eq("consumed", true)
    .order("verified_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const verifiedRecently =
    !!otpRow?.verified_at && Date.now() - new Date(otpRow.verified_at).getTime() < OTP_VALIDITY_WINDOW_MS;

  if (!verifiedRecently) {
    return NextResponse.json({ error: "Please verify your email before resetting your password." }, { status: 403 });
  }

  // Find the member's account id (members.id == the auth user id, set at signup).
  const { data: member, error: memberError } = await supabaseAdmin
    .from("members")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (memberError || !member) {
    return NextResponse.json({ error: "No account found with that email." }, { status: 404 });
  }

  const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(member.id, { password: newPassword });
  if (updateError) {
    console.error("[reset-password] updateUserById failed:", updateError.message);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 502 });
  }

  // Clean up used OTP rows for this email (best-effort).
  await supabaseAdmin.from("otp_codes").delete().eq("email", email);

  return NextResponse.json({ success: true });
}
