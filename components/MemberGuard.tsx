"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Lock } from "lucide-react";
import { Crest } from "@/components/ui/Crest";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { useMemberAuth } from "@/lib/memberAuth";

export function MemberGuard({ children }: { children: React.ReactNode }) {
  const { user, verifySession } = useMemberAuth();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    verifySession().finally(() => setChecked(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!checked) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <Crest size={40} animate />
        <p className="eyebrow">Loading…</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="section-padding py-24 sm:py-32 min-h-[60vh] flex items-center justify-center">
        <GlassCard hover={false} className="max-w-md mx-auto text-center py-12">
          <div className="flex justify-center">
            <span className="rounded-full p-3 bg-[var(--color-gold)]/10 text-[var(--color-gold-bright)]">
              <Lock size={22} />
            </span>
          </div>
          <h2 className="font-display text-xl mt-5 text-[var(--color-ivory)]">Members Only</h2>
          <p className="mt-2 text-sm text-[var(--color-ash)]">Log in or join the community to see this page.</p>
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/login" className="w-full sm:w-auto">
              <Button className="w-full">Login</Button>
            </Link>
            <Link href="/join" className="w-full sm:w-auto">
              <Button variant="secondary" className="w-full">
                Join Community
              </Button>
            </Link>
          </div>
        </GlassCard>
      </div>
    );
  }

  return <>{children}</>;
}
