import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

async function getVerifiedMember(request: Request) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");
  if (!token || !supabaseAdmin) return null;

  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user) return null;

  // Only real member accounts use this route — admins manage their own
  // profile through Supabase directly, not this member-facing endpoint.
  const role = data.user.user_metadata?.role;
  if (role && role !== "member") return null;

  return data.user;
}

export async function GET(request: Request) {
  const user = await getVerifiedMember(request);
  if (!user || !supabaseAdmin) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { data: member } = await supabaseAdmin
    .from("members")
    .select("name, email, phone")
    .eq("id", user.id)
    .maybeSingle();

  return NextResponse.json({
    name: member?.name ?? user.user_metadata?.name ?? "",
    email: member?.email ?? user.email ?? "",
    phone: member?.phone ?? "",
  });
}

export async function PATCH(request: Request) {
  const user = await getVerifiedMember(request);
  if (!user || !supabaseAdmin) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  let body: { name?: string; phone?: string; newPassword?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  // Profile fields (name / phone)
  if (body.name !== undefined || body.phone !== undefined) {
    const name = body.name?.trim();
    if (name !== undefined && !name) {
      return NextResponse.json({ error: "Name can't be empty." }, { status: 400 });
    }
    if (body.phone && !/^[0-9+\-\s()]{7,15}$/.test(body.phone)) {
      return NextResponse.json({ error: "Enter a valid phone number." }, { status: 400 });
    }

    const memberUpdate: Record<string, unknown> = {};
    if (name !== undefined) memberUpdate.name = name;
    if (body.phone !== undefined) memberUpdate.phone = body.phone || null;

    const { error: memberError } = await supabaseAdmin.from("members").update(memberUpdate).eq("id", user.id);
    if (memberError) {
      console.error("[account] members update failed:", memberError.message);
      return NextResponse.json({ error: "Couldn't save your profile. Please try again." }, { status: 502 });
    }

    if (name !== undefined) {
      const { error: authUpdateError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
        user_metadata: { ...user.user_metadata, name },
      });
      if (authUpdateError) console.error("[account] auth metadata update failed:", authUpdateError.message);
    }
  }

  // Password change
  if (body.newPassword) {
    if (body.newPassword.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
    }
    const { error: passwordError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
      password: body.newPassword,
    });
    if (passwordError) {
      console.error("[account] password update failed:", passwordError.message);
      return NextResponse.json({ error: "Couldn't update your password. Please try again." }, { status: 502 });
    }
  }

  return NextResponse.json({ success: true });
}
