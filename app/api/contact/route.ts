import { NextResponse } from "next/server";
import { Resend } from "resend";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

const NOTIFY_EMAIL = "kingwarriorscommunity@gmail.com";

export async function POST(request: Request) {
  let body: { name?: string; email?: string; subject?: string; message?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { name, email, subject, message } = body;
  if (!name?.trim() || !email?.trim() || !subject?.trim() || !message?.trim()) {
    return NextResponse.json({ error: "All fields are required." }, { status: 400 });
  }

  // 1. Save to Supabase (best-effort — a failed save shouldn't block emailing).
  let saved = false;
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from("contact_messages").insert({ name, email, subject, message });
    saved = !error;
    if (error) console.error("[contact] Supabase insert failed:", error.message);
  }

  // 2. Email a notification (best-effort — a failed email shouldn't block saving).
  let emailed = false;
  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey) {
    try {
      const resend = new Resend(resendKey);
      const { error } = await resend.emails.send({
        from: "King Warriors Community <onboarding@resend.dev>",
        to: NOTIFY_EMAIL,
        replyTo: email,
        subject: `New contact message: ${subject}`,
        text: `From: ${name} <${email}>\n\n${message}`,
      });
      emailed = !error;
      if (error) console.error("[contact] Resend send failed:", error.message);
    } catch (err) {
      console.error("[contact] Resend send threw:", err);
    }
  }

  if (!saved && !emailed) {
    return NextResponse.json(
      { error: "Couldn't send your message right now. Please email us directly instead." },
      { status: 502 }
    );
  }

  return NextResponse.json({ success: true, saved, emailed });
}
