import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { createCrud } from "@/lib/supabaseCrud";
import type { Member } from "@/lib/types";

interface MemberRow {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  why_join: string | null;
  joined_at: string;
}

function fromRow(row: MemberRow): Member {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone ?? undefined,
    whyJoin: row.why_join ?? undefined,
    joinedAt: row.joined_at,
  };
}

function toRow(item: Partial<Member>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (item.name !== undefined) row.name = item.name;
  if (item.email !== undefined) row.email = item.email;
  if (item.phone !== undefined) row.phone = item.phone || null;
  if (item.whyJoin !== undefined) row.why_join = item.whyJoin || null;
  return row;
}

export const membersCrud = createCrud<Member, MemberRow>("members", toRow, fromRow, {
  column: "joined_at",
  ascending: false,
});

/**
 * Public signup — separate from membersCrud.create because it must work
 * for anonymous visitors (no login), unlike every other "create" in this
 * app which requires an authenticated admin session.
 */
export async function submitMembership(
  member: Omit<Member, "id" | "joinedAt">
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return { success: false, error: "Signup isn't connected yet — please contact the community directly." };
  }
  const { error } = await supabase.from("members").insert({
    name: member.name,
    email: member.email,
    phone: member.phone || null,
    why_join: member.whyJoin || null,
  });
  if (error) {
    if (error.code === "23505") return { success: false, error: "This email has already joined the community." };
    return { success: false, error: "Something went wrong. Please try again." };
  }
  return { success: true };
}
