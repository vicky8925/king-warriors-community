"use client";

import { FormEvent, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Send } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Crest } from "@/components/ui/Crest";

interface FormValues {
  name: string;
  email: string;
  phone: string;
  whyJoin: string;
}

const initialValues: FormValues = { name: "", email: "", phone: "", whyJoin: "" };

export default function JoinPage() {
  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<Partial<FormValues>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function validate(v: FormValues) {
    const e: Partial<FormValues> = {};
    if (!v.name.trim()) e.name = "Please enter your name.";
    if (!v.email.trim()) e.email = "Please enter your email.";
    else if (!/^\S+@\S+\.\S+$/.test(v.email)) e.email = "Enter a valid email address.";
    if (v.phone && !/^[0-9+\-\s()]{7,15}$/.test(v.phone)) e.phone = "Enter a valid phone number.";
    return e;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const validationErrors = validate(values);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name,
          email: values.email,
          phone: values.phone || undefined,
          whyJoin: values.whyJoin || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setSubmitted(true);
    } catch (err) {
      setErrors({ email: err instanceof Error ? err.message : "Couldn't submit. Please try again." });
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="section-padding py-24 sm:py-32 min-h-[70vh] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-lg mx-auto text-center"
        >
          <div className="flex justify-center">
            <CheckCircle2 size={48} className="text-[var(--color-success)]" />
          </div>
          <h1 className="font-display mt-6 text-3xl text-[var(--color-ivory)]">Welcome to the Community</h1>
          <p className="mt-4 text-[var(--color-ash)] leading-relaxed">
            Thank you for joining, {values.name.split(" ")[0]}. The council will review your application and reach
            out within 48 hours with next steps.
          </p>
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
          eyebrow="Your Place Awaits"
          title="Join King Warriors Community"
          description="Ten thousand warriors rose together. Tell us a little about yourself to get started — applications are reviewed within 48 hours."
          align="center"
        />

        <GlassCard hover={false} className="mt-10">
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <Field label="Full Name" error={errors.name}>
              <input
                value={values.name}
                onChange={(e) => setValues({ ...values, name: e.target.value })}
                className={inputClass(!!errors.name)}
                placeholder="Your full name"
              />
            </Field>
            <Field label="Email" error={errors.email}>
              <input
                value={values.email}
                onChange={(e) => setValues({ ...values, email: e.target.value })}
                className={inputClass(!!errors.email)}
                placeholder="you@example.com"
                type="email"
              />
            </Field>
            <Field label="Phone (optional)" error={errors.phone}>
              <input
                value={values.phone}
                onChange={(e) => setValues({ ...values, phone: e.target.value })}
                className={inputClass(!!errors.phone)}
                placeholder="+91 98765 43210"
              />
            </Field>
            <Field label="Why do you want to join? (optional)">
              <textarea
                value={values.whyJoin}
                onChange={(e) => setValues({ ...values, whyJoin: e.target.value })}
                className={inputClass(false) + " min-h-[100px] resize-y"}
                placeholder="Tell us a bit about yourself..."
              />
            </Field>
            <Button type="submit" size="lg" className="w-full" disabled={submitting}>
              {submitting ? "Submitting..." : "Join Community"} <Send size={16} />
            </Button>
          </form>
        </GlassCard>
      </div>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-mono uppercase tracking-wider text-[var(--color-ash)]">{label}</span>
      <div className="mt-2">{children}</div>
      {error && <span className="text-xs text-[var(--color-danger)] mt-1.5 block">{error}</span>}
    </label>
  );
}

function inputClass(hasError: boolean) {
  return `w-full glass rounded-xl px-4 py-3 text-sm text-[var(--color-ivory)] placeholder:text-[var(--color-ash-dim)] outline-none transition-colors ${
    hasError ? "border-[var(--color-danger)]/60" : "focus:border-[var(--color-gold)]/50"
  }`;
}
