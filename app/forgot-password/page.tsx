"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Send, ShieldCheck, ArrowLeft, KeyRound } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Crest } from "@/components/ui/Crest";
import { useMemberAuth } from "@/lib/memberAuth";

type Step = "email" | "otp" | "newPassword" | "done";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const memberLogin = useMemberAuth((s) => s.login);

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  useEffect(() => {
    if (step !== "done") return;
    let cancelled = false;
    (async () => {
      await memberLogin(email, newPassword);
      if (cancelled) return;
      setTimeout(() => router.push("/"), 1800);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  async function sendOtp(e?: FormEvent) {
    e?.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError("Enter a valid email address.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, purpose: "reset" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setStep("otp");
      setResendCooldown(30);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't send code. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function verifyOtp(e: FormEvent) {
    e.preventDefault();
    if (code.trim().length !== 6) {
      setError("Enter the 6-digit code from your email.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Incorrect code.");
      setStep("newPassword");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Incorrect code.");
    } finally {
      setSubmitting(false);
    }
  }

  async function submitNewPassword(e: FormEvent) {
    e.preventDefault();
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setStep("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't reset password. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (step === "done") {
    return (
      <div className="section-padding py-24 sm:py-32 min-h-[70vh] flex items-center justify-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-lg mx-auto text-center">
          <div className="flex justify-center">
            <CheckCircle2 size={48} className="text-[var(--color-success)]" />
          </div>
          <h1 className="font-display mt-6 text-3xl text-[var(--color-ivory)]">Password Reset</h1>
          <p className="mt-4 text-[var(--color-ash)] leading-relaxed">Taking you home&hellip;</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="section-padding py-16 sm:py-24">
      <div className="max-w-xl mx-auto">
        <div className="flex justify-center mb-6">
          <Crest size={48} />
        </div>
        <SectionHeading
          eyebrow="Account Recovery"
          title="Reset Your Password"
          description="We'll email you a code to verify it's really you."
          align="center"
        />

        <GlassCard hover={false} className="mt-8">
          <AnimatePresence mode="wait">
            {step === "email" && (
              <motion.form
                key="email"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                onSubmit={sendOtp}
                className="space-y-5"
              >
                <Field label="Email">
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputClass}
                    placeholder="you@example.com"
                    type="email"
                    autoFocus
                  />
                </Field>
                {error && <p className="text-xs text-[var(--color-danger)]">{error}</p>}
                <Button type="submit" size="lg" className="w-full" disabled={submitting}>
                  {submitting ? "Sending code..." : "Send Reset Code"} <Send size={16} />
                </Button>
                <p className="text-xs text-center text-[var(--color-ash-dim)]">
                  <a href="/login" className="text-[var(--color-gold-bright)] hover:underline">
                    Back to login
                  </a>
                </p>
              </motion.form>
            )}

            {step === "otp" && (
              <motion.form
                key="otp"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                onSubmit={verifyOtp}
                className="space-y-5"
              >
                <div className="flex items-center gap-2 text-sm text-[var(--color-ash)]">
                  <ShieldCheck size={15} className="text-[var(--color-gold-bright)]" />
                  Code sent to <span className="text-[var(--color-ivory)]">{email}</span>
                </div>
                <Field label="6-Digit Code">
                  <input
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    className={inputClass + " text-center text-2xl tracking-[0.5em] font-mono"}
                    placeholder="······"
                    inputMode="numeric"
                    autoFocus
                  />
                </Field>
                {error && <p className="text-xs text-[var(--color-danger)]">{error}</p>}
                <Button type="submit" size="lg" className="w-full" disabled={submitting}>
                  {submitting ? "Verifying..." : "Verify Code"}
                </Button>
                <div className="flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setStep("email");
                      setCode("");
                      setError(null);
                    }}
                    className="flex items-center gap-1 text-[var(--color-ash)] hover:text-[var(--color-ivory)] cursor-pointer"
                  >
                    <ArrowLeft size={12} /> Change email
                  </button>
                  <button
                    type="button"
                    onClick={() => sendOtp()}
                    disabled={resendCooldown > 0 || submitting}
                    className="text-[var(--color-gold-bright)] hover:underline disabled:text-[var(--color-ash-dim)] disabled:no-underline cursor-pointer disabled:cursor-default"
                  >
                    {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : "Resend code"}
                  </button>
                </div>
              </motion.form>
            )}

            {step === "newPassword" && (
              <motion.form
                key="newPassword"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                onSubmit={submitNewPassword}
                className="space-y-5"
              >
                <div className="flex items-center gap-2 text-sm text-[var(--color-success)]">
                  <CheckCircle2 size={15} /> Email verified
                </div>
                <Field label="New Password">
                  <input
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className={inputClass}
                    placeholder="At least 6 characters"
                    type="password"
                    autoFocus
                  />
                </Field>
                <Field label="Confirm New Password">
                  <input
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={inputClass}
                    placeholder="Re-enter password"
                    type="password"
                  />
                </Field>
                {error && <p className="text-xs text-[var(--color-danger)]">{error}</p>}
                <Button type="submit" size="lg" className="w-full" disabled={submitting}>
                  {submitting ? "Saving..." : "Reset Password"} <KeyRound size={16} />
                </Button>
              </motion.form>
            )}
          </AnimatePresence>
        </GlassCard>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-mono uppercase tracking-wider text-[var(--color-ash)]">{label}</span>
      <div className="mt-2">{children}</div>
    </label>
  );
}

const inputClass =
  "w-full glass rounded-xl px-4 py-3 text-sm text-[var(--color-ivory)] placeholder:text-[var(--color-ash-dim)] outline-none transition-colors focus:border-[var(--color-gold)]/50";
