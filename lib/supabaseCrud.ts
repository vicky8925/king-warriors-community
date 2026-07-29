import { supabase, isSupabaseConfigured } from "@/lib/supabase";

/**
 * Creates a small set of fetch/create/update/remove helpers for a Supabase
 * table. When Supabase isn't configured (no env vars set), fetchAll() just
 * returns the mock data passed in, and create/update/remove are no-ops that
 * return null/false — so every page keeps working in demo mode exactly as
 * before, and automatically starts talking to the real database the moment
 * NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY are set.
 */
export function createCrud<T extends { id: string }, Row extends { id: string }>(
  table: string,
  toRow: (item: Partial<T>) => Record<string, unknown>,
  fromRow: (row: Row) => T,
  orderBy?: { column: string; ascending?: boolean }
) {
  async function fetchAll(mockData: T[]): Promise<T[]> {
    if (!isSupabaseConfigured || !supabase) return mockData;
    let query = supabase.from(table).select("*");
    if (orderBy) query = query.order(orderBy.column, { ascending: orderBy.ascending ?? true });
    const { data, error } = await query;
    if (error || !data) {
      console.error(`[${table}] fetch failed, falling back to mock data:`, error?.message);
      return mockData;
    }
    return (data as Row[]).map(fromRow);
  }

  async function create(item: Omit<T, "id">): Promise<T | null> {
    if (!isSupabaseConfigured || !supabase) return null;
    const { data, error } = await supabase.from(table).insert(toRow(item as Partial<T>)).select().single();
    if (error || !data) {
      console.error(`[${table}] create failed:`, error?.message);
      return null;
    }
    return fromRow(data as Row);
  }

  async function update(id: string, item: Partial<T>): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) return false;
    const { error } = await supabase.from(table).update(toRow(item)).eq("id", id);
    if (error) {
      console.error(`[${table}] update failed:`, error.message);
      return false;
    }
    return true;
  }

  async function remove(id: string): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) return false;
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (error) {
      console.error(`[${table}] delete failed:`, error.message);
      return false;
    }
    return true;
  }

  return { fetchAll, create, update, remove };
}
