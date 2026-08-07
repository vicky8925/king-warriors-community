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

  // 3. Notify the admin via Resend (existing behavior — best-effort).
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

  // 4. Welcome email to the member themselves, via Brevo — Resend's
  // unverified sender can only email NOTIFY_EMAIL (our own inbox), so
  // anything going to an arbitrary member's address has to go through
  // Brevo, same as the OTP codes.
  const brevoKey = process.env.BREVO_API_KEY;
  if (brevoKey) {
    try {
      const res = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: { "Content-Type": "application/json", "api-key": brevoKey },
        body: JSON.stringify({
          sender: { name: "King Warriors Community", email: NOTIFY_EMAIL },
          to: [{ email, name }],
          subject: "Welcome to King Warriors Community 👑",
          textContent:
            `Welcome, ${name}!\n\n` +
            `You're officially part of King Warriors Community — together we rise, together we lead.\n\n` +
            `The council will review your application and reach out within 48 hours with next steps.\n\n` +
            `In the meantime, log in anytime at kingwarriorscommunity to check the latest updates, events, and more.\n\n` +
            `— King Warriors Community`,
        }),
      });
      if (!res.ok) console.error("[join] Brevo welcome email failed:", await res.text());
    } catch (err) {
      console.error("[join] Brevo welcome email threw:", err);
    }
  }

  return NextResponse.json({ success: true });
}
