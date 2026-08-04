import { NextResponse } from "next/server";
import { Resend } from "resend";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const NOTIFY_EMAIL = "kingwarriorscommunity@gmail.com";
const OTP_VALIDITY_WINDOW_MS = 30 * 60 * 1000; // must have verified within the last 30 minutes

export async function POST(request: Request) {
  let body: { name?: string; email?: string; password?: string; phone?: string; whyJoin?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const name = body.name?.trim();
  const email = body.email?.trim().toLowerCase();
  const password = body.password ?? "";
  const phone = body.phone?.trim();
  const whyJoin = body.whyJoin?.trim();

  if (!name || !email) {
    return NextResponse.json({ error: "Name and email are required." }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
  }

  if (!supabaseAdmin) {
    return NextResponse.json(
      { error: "Signup isn't connected yet — please contact the community directly." },
      { status: 503 }
    );
  }

  // Require a recently-verified OTP for this email — this is what actually
  // enforces "you must verify your email before joining", not just the UI.
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
    return NextResponse.json({ error: "Please verify your email before joining." }, { status: 403 });
  }

  // 1. Create a real login account for this member. email_confirm: true is
  // safe here because we already verified the email ourselves via OTP —
  // this is not skipping verification, just not making them verify twice.
  const { data: created, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name, role: "member" },
  });

  if (authError || !created.user) {
    if (authError?.code === "email_exists" || authError?.message?.includes("already been registered")) {
      return NextResponse.json({ error: "This email has already joined the community." }, { status: 409 });
    }
    console.error("[join] createUser failed:", authError?.message);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 502 });
  }

  // 2. Add them to the members directory (shown in Admin → Members).
  const { error: insertError } = await supabaseAdmin.from("members").insert({
    id: created.user.id,
    name,
    email,
    phone: phone || null,
    why_join: whyJoin || null,
  });
  if (insertError) {
    console.error("[join] members insert failed:", insertError.message);
    // Not fatal — the login account exists either way, so don't block the signup.
  }

  // Clean up used OTP rows for this email (best-effort).
  await supabaseAdmin.from("otp_codes").delete().eq("email", email);

  // 3. Email a notification (best-effort — a failed email shouldn't fail the signup).
  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey) {
    try {
      const resend = new Resend(resendKey);
      const { error } = await resend.emails.send({
        from: "King Warriors Community <onboarding@resend.dev>",
        to: NOTIFY_EMAIL,
        replyTo: email,
        subject: `New member signup: ${name}`,
        text: [
          `Name: ${name}`,
          `Email: ${email}`,
          phone ? `Phone: ${phone}` : null,
          whyJoin ? `\nWhy they want to join:\n${whyJoin}` : null,
        ]
          .filter(Boolean)
          .join("\n"),
      });
      if (error) console.error("[join] Resend send failed:", error.message);
    } catch (err) {
      console.error("[join] Resend send threw:", err);
    }
  }

  return NextResponse.json({ success: true });
}
