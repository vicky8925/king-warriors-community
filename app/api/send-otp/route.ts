import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: Request) {
  let body: { email?: string; purpose?: "signup" | "reset" };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  const purpose = body.purpose === "reset" ? "reset" : "signup";
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Signup verification isn't configured yet." }, { status: 503 });
  }

  const { data: existing } = await supabaseAdmin.from("members").select("id").eq("email", email).maybeSingle();

  if (purpose === "signup" && existing) {
    return NextResponse.json({ error: "This email has already joined the community." }, { status: 409 });
  }
  if (purpose === "reset" && !existing) {
    return NextResponse.json({ error: "No account found with that email." }, { status: 404 });
  }

  const code = generateCode();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  const { error: insertError } = await supabaseAdmin.from("otp_codes").insert({ email, code, expires_at: expiresAt });
  if (insertError) {
    console.error("[send-otp] insert failed:", insertError.message);
    return NextResponse.json({ error: "Couldn't send verification code. Please try again." }, { status: 500 });
  }

  const brevoKey = process.env.BREVO_API_KEY;
  if (!brevoKey) {
    console.error("[send-otp] BREVO_API_KEY not set");
    return NextResponse.json({ error: "Email service isn't configured yet." }, { status: 503 });
  }

  const subject =
    purpose === "reset"
      ? "Your King Warriors Community password reset code"
      : "Your King Warriors Community verification code";

  try {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: { "Content-Type": "application/json", "api-key": brevoKey },
      body: JSON.stringify({
        sender: { name: "King Warriors Community", email: "kingwarriorscommunity@gmail.com" },
        to: [{ email }],
        subject,
        textContent: `Your verification code is: ${code}\n\nThis code expires in 10 minutes. If you didn't request this, you can ignore this email.`,
      }),
    });
    if (!res.ok) {
      console.error("[send-otp] Brevo send failed:", await res.text());
      return NextResponse.json({ error: "Couldn't send the verification email. Please try again." }, { status: 502 });
    }
  } catch (err) {
    console.error("[send-otp] Brevo send threw:", err);
    return NextResponse.json({ error: "Couldn't send the verification email. Please try again." }, { status: 502 });
  }

  return NextResponse.json({ success: true });
}
