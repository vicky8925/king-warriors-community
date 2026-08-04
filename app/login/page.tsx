"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Mail, Lock } from "lucide-react";
import { Crest } from "@/components/ui/Crest";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { EmberBackground } from "@/components/ui/EmberBackground";
import { useMemberAuth } from "@/lib/memberAuth";

export default function LoginPage() {
  const router = useRouter();
  const login = useMemberAuth((s) => s.login);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const result = await login(email, password);
    setSubmitting(false);
    if (result.success) {
      toast.success("Welcome back, warrior.");
      router.push("/");
    } else {
      setError(result.error ?? "Login failed.");
    }
  }

  return (
    <div className="relative min-h-[calc(100vh-5rem)] flex items-center justify-center overflow-hidden">
      <EmberBackground count={16} />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_20%,rgba(201,162,39,0.12),transparent)]" />

      <GlassCard strong hover={false} className="relative z-10 w-full max-w-md mx-4 py-10">
        <div className="flex flex-col items-center text-center">
          <Crest size={48} />
          <h1 className="font-display text-xl mt-4 text-[var(--color-ivory)]">Welcome Back</h1>
          <p className="eyebrow mt-2">Member Login</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <label className="block">
            <span className="text-xs font-mono uppercase tracking-wider text-[var(--color-ash)]">Email</span>
            <div className="relative mt-2">
              <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-ash-dim)]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full glass rounded-xl pl-11 pr-4 py-3 text-sm text-[var(--color-ivory)] outline-none focus:border-[var(--color-gold)]/50"
                placeholder="you@example.com"
              />
            </div>
          </label>
          <label className="block">
            <span className="text-xs font-mono uppercase tracking-wider text-[var(--color-ash)]">Password</span>
            <div className="relative mt-2">
              <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-ash-dim)]" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full glass rounded-xl pl-11 pr-4 py-3 text-sm text-[var(--color-ivory)] outline-none focus:border-[var(--color-gold)]/50"
                placeholder="••••••••"
              />
            </div>
          </label>

          {error && <p className="text-xs text-[var(--color-danger)]">{error}</p>}

          <Button type="submit" className="w-full" size="lg" disabled={submitting}>
            {submitting ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-[var(--color-ash)]">
          Not a member yet?{" "}
          <a href="/join" className="text-[var(--color-gold-bright)] hover:underline">
            Join the community
          </a>
        </p>
      </GlassCard>
    </div>
  );
}
