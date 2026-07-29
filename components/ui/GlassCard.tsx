"use client";

import { forwardRef } from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassCardProps extends HTMLMotionProps<"div"> {
  strong?: boolean;
  hover?: boolean;
  as?: "div";
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, strong = false, hover = true, children, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        className={cn(
          "rounded-2xl p-6",
          strong ? "glass-strong" : "glass",
          hover && "transition-all duration-300 hover:-translate-y-1 hover:border-[var(--color-gold)]/40 hover:shadow-[var(--shadow-gold-glow)]",
          className
        )}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
GlassCard.displayName = "GlassCard";

export function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-[var(--color-gold)]/30 bg-[var(--color-gold)]/10 px-3 py-1 text-xs font-medium text-[var(--color-gold-bright)] font-mono uppercase tracking-wider",
        className
      )}
    >
      {children}
    </span>
  );
}
