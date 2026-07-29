"use client";

import { motion } from "framer-motion";
import { Users, Trophy, CalendarClock, HeartHandshake } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { GlassCard } from "@/components/ui/GlassCard";

const PILLARS = [
  {
    icon: Users,
    title: "Mentorship That Compounds",
    description: "Structured pairing with senior warriors so every new member has a guide, not just a group chat.",
  },
  {
    icon: Trophy,
    title: "Rewards Earned, Not Given",
    description: "Weekly and monthly recognition tied to real contribution — transparent criteria, no favoritism.",
  },
  {
    icon: CalendarClock,
    title: "Events That Build Discipline",
    description: "From online AMAs to full-day bootcamps, every gathering is designed to sharpen, not just socialize.",
  },
  {
    icon: HeartHandshake,
    title: "A Standard, Not Just a Space",
    description: "Twelve chapters unified by the same code of respect, consistency, and collective accountability.",
  },
];

export function OverviewSection() {
  return (
    <section id="overview" className="section-padding py-20 sm:py-28">
      <div className="max-w-6xl mx-auto">
        <SectionHeading
          eyebrow="Why King Warriors"
          title="A community built the way a warrior trains — with structure, discipline, and people who push you forward."
          align="left"
        />

        <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {PILLARS.map((p, i) => (
            <GlassCard
              key={p.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <div className="rounded-xl w-11 h-11 flex items-center justify-center bg-[var(--color-gold)]/10 text-[var(--color-gold-bright)]">
                <p.icon size={20} />
              </div>
              <h3 className="font-display text-lg mt-5 text-[var(--color-ivory)] leading-snug">{p.title}</h3>
              <p className="mt-2.5 text-sm text-[var(--color-ash)] leading-relaxed">{p.description}</p>
            </GlassCard>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="hairline mt-20"
        />
      </div>
    </section>
  );
}
