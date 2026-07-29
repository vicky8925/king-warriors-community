"use client";

import { forwardRef } from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "ref"> {
  variant?: Variant;
  size?: Size;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-gradient-to-r from-[var(--color-gold)] to-[var(--color-gold-bright)] text-[#141108] font-semibold hover:shadow-[var(--shadow-gold-glow-lg)] shadow-[var(--shadow-gold-glow)]",
  secondary:
    "glass text-[var(--color-ivory)] border-[var(--color-hairline)] hover:border-[var(--color-gold)] hover:text-[var(--color-gold-bright)]",
  ghost: "text-[var(--color-ash)] hover:text-[var(--color-gold-bright)]",
  danger: "bg-[var(--color-danger)]/90 text-white hover:bg-[var(--color-danger)]",
};

const sizeClasses: Record<Size, string> = {
  sm: "text-xs px-4 py-2 gap-1.5",
  md: "text-sm px-6 py-3 gap-2",
  lg: "text-base px-8 py-4 gap-2.5",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
        className={cn(
          "inline-flex items-center justify-center rounded-full transition-colors duration-200 cursor-pointer disabled:opacity-50 disabled:pointer-events-none",
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {children}
      </motion.button>
    );
  }
);
Button.displayName = "Button";
