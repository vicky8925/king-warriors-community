"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { AdminUser } from "@/lib/types";

interface AuthState {
  user: AdminUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  verifySession: () => Promise<void>;
}

/**
 * Demo credentials (mock mode, used when Supabase env vars are absent):
 *   email:    admin@kingwarriors.community
 *   password: warriors2026
 *
 * In mock mode this store just checks against the constant below so the
 * whole admin dashboard is explorable without any backend setup. Once
 * NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY are set, login()
 * automatically calls supabase.auth.signInWithPassword instead — the rest
 * of the dashboard code does not need to change.
 */
const MOCK_ADMIN = {
  email: "admin@kingwarriors.community",
  password: "warriors2026",
  user: {
    id: "mock-admin-1",
    email: "admin@kingwarriors.community",
    name: "Aarav Sharma",
    role: "founder" as const,
    avatarUrl: "https://i.pravatar.cc/100?img=12",
  },
};

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true });

        if (isSupabaseConfigured && supabase) {
          const { data, error } = await supabase.auth.signInWithPassword({ email, password });
          set({ isLoading: false });
          if (error || !data.user) return { success: false, error: error?.message ?? "Invalid credentials" };
          set({
            user: {
              id: data.user.id,
              email: data.user.email ?? "",
              name: data.user.user_metadata?.name ?? data.user.email ?? "Admin",
              role: data.user.user_metadata?.role ?? "moderator",
            },
          });
          return { success: true };
        }

        // Mock mode
        await new Promise((r) => setTimeout(r, 500));
        set({ isLoading: false });
        if (email === MOCK_ADMIN.email && password === MOCK_ADMIN.password) {
          set({ user: MOCK_ADMIN.user });
          return { success: true };
        }
        return { success: false, error: "Invalid email or password." };
      },

      logout: async () => {
        if (isSupabaseConfigured && supabase) await supabase.auth.signOut();
        set({ user: null });
      },

      // Confirms the cached login is backed by a real, currently-valid
      // Supabase session. This matters because zustand's `persist` keeps
      // `user` in localStorage across visits — without this check, a user
      // who logged in before Supabase was connected (or whose session has
      // since expired) would still appear "logged in" to the app while
      // every database write silently fails because there's no valid
      // access token attached to the request.
      verifySession: async () => {
        if (!isSupabaseConfigured || !supabase) return; // mock mode: nothing to verify
        const { data } = await supabase.auth.getSession();
        if (!data.session) set({ user: null });
      },
    }),
    { name: "kw-admin-auth" }
  )
);
