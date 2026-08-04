"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export interface MemberUser {
  id: string;
  name: string;
  email: string;
}

interface MemberAuthState {
  user: MemberUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  verifySession: () => Promise<void>;
}

function toMemberUser(user: { id: string; email?: string; user_metadata?: { name?: string } }): MemberUser {
  return {
    id: user.id,
    name: user.user_metadata?.name ?? user.email ?? "Member",
    email: user.email ?? "",
  };
}

export const useMemberAuth = create<MemberAuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: false,

      login: async (email, password) => {
        if (!isSupabaseConfigured || !supabase) {
          return { success: false, error: "Login isn't connected yet." };
        }
        set({ isLoading: true });
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error || !data.user) {
          set({ isLoading: false });
          return { success: false, error: "Incorrect email or password." };
        }
        // A council (admin/founder/moderator) account trying the member
        // login — direct them to the right place instead of half-logging in.
        const role = data.user.user_metadata?.role;
        if (role && role !== "member") {
          await supabase.auth.signOut();
          set({ isLoading: false });
          return { success: false, error: "This looks like a council account — use the admin login instead." };
        }
        set({ isLoading: false, user: toMemberUser(data.user) });
        return { success: true };
      },

      logout: async () => {
        if (isSupabaseConfigured && supabase) await supabase.auth.signOut();
        set({ user: null });
      },

      // Confirms the cached login is backed by a real, currently-valid
      // member session (not expired, not a council account).
      verifySession: async () => {
        if (!isSupabaseConfigured || !supabase) return;
        const { data } = await supabase.auth.getSession();
        if (!data.session) {
          set({ user: null });
          return;
        }
        const role = data.session.user.user_metadata?.role;
        if (role && role !== "member") {
          set({ user: null });
          return;
        }
        set({ user: toMemberUser(data.session.user) });
      },
    }),
    { name: "kw-member-auth" }
  )
);
