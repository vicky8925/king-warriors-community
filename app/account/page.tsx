"use client";

import { FormEvent, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Save, KeyRound } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { supabase } from "@/lib/supabase";
import { useMemberAuth } from "@/lib/memberAuth";
import { MemberGuard } from "@/components/MemberGuard";

export default function AccountPage() {
  return (
    <MemberGuard redirect>
      <AccountContent />
    </MemberGuard>
  );
}

function AccountContent() {
  const verifySession = useMemberAuth((s) => s.verifySession);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  async function authHeader() {
    const { data } = await supabase!.auth.getSession();
    return { Authorization: `Bearer ${data.session?.access_token}` };
  }

  useEffect(() => {
    (async () => {
      try {
        const headers = await authHeader();
        const res = await fetch("/api/account", { headers });
        const data = await res.json();
        if (res.ok) {
          setName(data.name);
          setEmail(data.email);
          setPhone(data.phone ?? "");
        }
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function saveProfile(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Name can't be empty.");
      return;
    }
    setSaving(true);
    try {
      const headers = await authHeader();
      const res = await fetch("/api/account", {
        method: "PATCH",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      toast.success("Profile updated.");
      await verifySession(); // refresh navbar name
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't save. Try again.");
    } finally {
      setSaving(false);
    }
  }

  async function changePassword(e: FormEvent) {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords don't match.");
      return;
    }
    setChangingPassword(true);
    try {
      const headers = await authHeader();
      const res = await fetch("/api/account", {
        method: "PATCH",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      toast.success("Password updated.");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't update password. Try again.");
    } finally {
      setChangingPassword(false);
    }
  }

  if (loading) {
    return <div className="section-padding py-24 text-center text-[var(--color-ash)]">Loading…</div>;
  }

  return (
    <div className="section-padding py-16 sm:py-24">
      <div className="max-w-xl mx-auto">
        <SectionHeading eyebrow="Your Profile" title="My Account" description="Update your details or change your password." />

        <GlassCard hover={false} className="mt-10">
          <form onSubmit={saveProfile} className="space-y-5">
            <Field label="Full Name">
              <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
            </Field>
            <Field label="Email">
              <input value={email} disabled className={inputClass + " opacity-60 cursor-not-allowed"} />
            </Field>
            <Field label="Phone">
              <input value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} placeholder="+91 98765 43210" />
            </Field>
            <Button type="submit" disabled={saving}>
              <Save size={15} /> {saving ? "Saving..." : "Save Profile"}
            </Button>
          </form>
        </GlassCard>

        <GlassCard hover={false} className="mt-6">
          <h3 className="font-display text-lg text-[var(--color-ivory)] mb-1">Change Password</h3>
          <p className="text-sm text-[var(--color-ash)] mb-5">No need to verify by email — you're already signed in.</p>
          <form onSubmit={changePassword} className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-5">
              <Field label="New Password">
                <input
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={inputClass}
                  type="password"
                  placeholder="At least 6 characters"
                />
              </Field>
              <Field label="Confirm New Password">
                <input
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={inputClass}
                  type="password"
                  placeholder="Re-enter password"
                />
              </Field>
            </div>
            <Button type="submit" variant="secondary" disabled={changingPassword}>
              <KeyRound size={15} /> {changingPassword ? "Updating..." : "Update Password"}
            </Button>
          </form>
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
