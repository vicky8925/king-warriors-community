"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}

export function SectionHeading({ eyebrow, title, description, align = "left", className }: SectionHeadingProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={cn("max-w-2xl", align === "center" && "mx-auto text-center", className)}
    >
      <span className="eyebrow">{eyebrow}</span>
      <h2 className="font-display mt-3 text-3xl sm:text-4xl md:text-[2.75rem] leading-[1.15] text-[var(--color-ivory)]">
        {title}
      </h2>
      {description && <p className="mt-4 text-[var(--color-ash)] text-base leading-relaxed">{description}</p>}
    </motion.div>
  );
}
