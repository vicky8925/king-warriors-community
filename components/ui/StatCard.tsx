"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, animate } from "framer-motion";
import { GlassCard } from "./GlassCard";

interface StatCardProps {
  label: string;
  value: number;
  suffix?: string;
  index?: number;
}

export function StatCard({ label, value, suffix = "", index = 0 }: StatCardProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, value, {
      duration: 1.6,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(Math.floor(v)),
    });
    return () => controls.stop();
  }, [inView, value]);

  return (
    <GlassCard
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="text-center py-8"
    >
      <span ref={ref} className="font-display block text-4xl sm:text-5xl text-gold-gradient tabular-nums">
        {display.toLocaleString()}
        {suffix}
      </span>
      <span className="eyebrow mt-3 block">{label}</span>
    </GlassCard>
  );
}
