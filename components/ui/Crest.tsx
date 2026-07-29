"use client";

import { cn } from "@/lib/utils";

interface CrestProps {
  className?: string;
  animate?: boolean;
  size?: number;
}

/**
 * The King Warriors crest — a shield-and-crown line mark used as the
 * primary signature element across the site: logo, section dividers,
 * loading state, and empty states. Kept to a single gold stroke so it
 * reads at any size without competing with photography.
 */
export function Crest({ className, animate = false, size = 40 }: CrestProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(className)}
      aria-hidden="true"
    >
      <path
        d="M32 6 L11 14 V30 C11 44 20 54 32 58 C44 54 53 44 53 30 V14 Z"
        stroke="url(#crest-gold)"
        strokeWidth="2"
        strokeLinejoin="round"
        className={animate ? "crest-path" : undefined}
      />
      <path
        d="M20 24 L26 30 L20 36 M44 24 L38 30 L44 36 M29 40 H35"
        stroke="url(#crest-gold)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={animate ? "crest-path" : undefined}
        style={animate ? { animationDelay: "0.3s" } : undefined}
      />
      <path
        d="M22 12 L26 6 L32 10 L38 6 L42 12"
        stroke="url(#crest-gold)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={animate ? "crest-path" : undefined}
        style={animate ? { animationDelay: "0.15s" } : undefined}
      />
      <defs>
        <linearGradient id="crest-gold" x1="11" y1="6" x2="53" y2="58" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F0C75E" />
          <stop offset="1" stopColor="#8B6914" />
        </linearGradient>
      </defs>
    </svg>
  );
}
