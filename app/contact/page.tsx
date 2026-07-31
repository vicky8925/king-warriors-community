"use client";

import { FormEvent, useState } from "react";
import toast from "react-hot-toast";
import { Mail, MessageCircle, Send } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { InstagramIcon, YoutubeIcon, LinkedinIcon } from "@/components/ui/SocialIcons";
import type { ContactFormValues } from "@/lib/types";

const initialValues: ContactFormValues = { name: "", email: "", subject: "", message: "" };

export default function ContactPage() {
  const [values, setValues] = useState<ContactFormValues>(initialValues);
  const [errors, setErrors] = useState<Partial<ContactFormValues>>({});
  const [submitting, setSubmitting] = useState(false);

  function validate(v: ContactFormValues) {
    const e: Partial<ContactFormValues> = {};
    if (!v.name.trim()) e.name = "Please enter your name.";
    if (!v.email.trim()) e.email = "Please enter your email.";
    else if (!/^\S+@\S+\.\S+$/.test(v.email)) e.email = "Enter a valid email address.";
    if (!v.subject.trim()) e.subject = "Please add a subject.";
    if (!v.message.trim() || v.message.trim().length < 10) e.message = "Message should be at least 10 characters.";
    return e;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const validationErrors = validate(values);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      toast.success("Message sent — the council will reply within 48 hours.");
      setValues(initialValues);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't send your message. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="section-padding py-16 sm:py-24">
      <div className="max-w-6xl mx-auto">
        <SectionHeading eyebrow="Reach Us" title="Contact" description="Questions, partnership ideas, or want to launch a chapter? Send word." />

        <div className="mt-12 grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Form */}
          <GlassCard hover={false} className="lg:col-span-3">
            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-5">
                <Field label="Name" error={errors.name}>
                  <input
                    value={values.name}
                    onChange={(e) => setValues({ ...values, name: e.target.value })}
                    className={inputClass(!!errors.name)}
                    placeholder="Your name"
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
              </div>
              <Field label="Subject" error={errors.subject}>
                <input
                  value={values.subject}
                  onChange={(e) => setValues({ ...values, subject: e.target.value })}
                  className={inputClass(!!errors.subject)}
                  placeholder="What's this about?"
                />
              </Field>
              <Field label="Message" error={errors.message}>
                <textarea
                  value={values.message}
                  onChange={(e) => setValues({ ...values, message: e.target.value })}
                  className={inputClass(!!errors.message) + " min-h-[140px] resize-y"}
                  placeholder="Tell us more..."
                />
              </Field>
              <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={submitting}>
                {submitting ? "Sending..." : "Send Message"} <Send size={16} />
              </Button>
            </form>
          </GlassCard>

          {/* Info */}
          <div className="lg:col-span-2 space-y-5">
            <GlassCard hover={false}>
              <a href="mailto:kingwarriorscommunity@gmail.com" className="flex items-center gap-3 text-[var(--color-ivory)]">
                <span className="rounded-full p-2.5 bg-[var(--color-gold)]/10 text-[var(--color-gold-bright)]"><Mail size={16} /></span>
                kingwarriorscommunity@gmail.com
              </a>
            </GlassCard>
            <GlassCard hover={false}>
              <a
                href="https://wa.me/910000000000"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-[var(--color-ivory)]"
              >
                <span className="rounded-full p-2.5 bg-[var(--color-gold)]/10 text-[var(--color-gold-bright)]"><MessageCircle size={16} /></span>
                Chat with us on WhatsApp
              </a>
            </GlassCard>
            <GlassCard hover={false}>
              <p className="eyebrow mb-4">Follow along</p>
              <div className="flex gap-3">
                {[InstagramIcon, YoutubeIcon, LinkedinIcon].map((Icon, i) => (
                  <a key={i} href="#" className="glass rounded-full p-2.5 text-[var(--color-ash)] hover:text-[var(--color-gold-bright)] transition-colors">
                    <Icon size={16} />
                  </a>
                ))}
              </div>
            </GlassCard>
            <GlassCard hover={false} className="p-0 overflow-hidden">
              <iframe
                title="King Warriors Community location"
                src="https://www.google.com/maps?q=Chennai&output=embed"
                className="w-full h-56 grayscale invert-[0.9] contrast-[1.1]"
                loading="lazy"
              />
            </GlassCard>
          </div>
        </div>
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
