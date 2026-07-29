"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Crest } from "@/components/ui/Crest";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const user = useAuth((s) => s.user);
  const verifySession = useAuth((s) => s.verifySession);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    // Give the persisted zustand store a tick to hydrate from storage,
    // then confirm the cached login is backed by a real, still-valid
    // Supabase session before trusting it.
    const t = setTimeout(() => {
      verifySession().finally(() => setChecked(true));
    }, 50);
    return () => clearTimeout(t);
  }, [verifySession]);

  useEffect(() => {
    if (checked && !user) router.replace("/admin/login");
  }, [checked, user, router]);

  if (!checked || !user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <Crest size={40} animate />
        <p className="eyebrow">Verifying access…</p>
      </div>
    );
  }

  return <>{children}</>;
}
