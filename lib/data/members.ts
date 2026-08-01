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

/** Live count of real signups from the /join page. 0 in mock mode. */
export async function countMembers(): Promise<number> {
  if (!isSupabaseConfigured || !supabase) return 0;
  const { count, error } = await supabase.from("members").select("*", { count: "exact", head: true });
  if (error || count === null) return 0;
  return count;
}
