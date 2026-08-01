import { NextResponse } from "next/server";
import { Resend } from "resend";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

const NOTIFY_EMAIL = "kingwarriorscommunity@gmail.com";

export async function POST(request: Request) {
  let body: { name?: string; email?: string; phone?: string; whyJoin?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { name, email, phone, whyJoin } = body;
  if (!name?.trim() || !email?.trim()) {
    return NextResponse.json({ error: "Name and email are required." }, { status: 400 });
  }

  if (!isSupabaseConfigured || !supabase) {
    return NextResponse.json(
      { error: "Signup isn't connected yet — please contact the community directly." },
      { status: 503 }
    );
  }

  // 1. Save to the members table.
  const { error: insertError } = await supabase.from("members").insert({
    name,
    email,
    phone: phone || null,
    why_join: whyJoin || null,
  });

  if (insertError) {
    if (insertError.code === "23505") {
      return NextResponse.json({ error: "This email has already joined the community." }, { status: 409 });
    }
    console.error("[join] Supabase insert failed:", insertError.message);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 502 });
  }

  // 2. Email a notification (best-effort — a failed email shouldn't fail the signup).
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
