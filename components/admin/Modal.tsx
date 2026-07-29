"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-black/70"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 260 }}
            className="fixed top-0 right-0 z-[85] h-full w-full sm:w-[480px] glass-strong overflow-y-auto"
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--color-hairline)] sticky top-0 bg-[var(--color-obsidian)]/90 backdrop-blur-md z-10">
              <h3 className="font-display text-lg text-[var(--color-ivory)]">{title}</h3>
              <button onClick={onClose} aria-label="Close" className="text-[var(--color-ash)] hover:text-[var(--color-ivory)] cursor-pointer">
                <X size={20} />
              </button>
            </div>
            <div className="p-6">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block mb-4">
      <span className="text-xs font-mono uppercase tracking-wider text-[var(--color-ash)]">{label}</span>
      <div className="mt-2">{children}</div>
    </label>
  );
}

export const inputClass =
  "w-full glass rounded-xl px-4 py-2.5 text-sm text-[var(--color-ivory)] placeholder:text-[var(--color-ash-dim)] outline-none focus:border-[var(--color-gold)]/50";
