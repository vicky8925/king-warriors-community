"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ScrollText } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { GlassCard } from "@/components/ui/GlassCard";
import { rules as mockRules, rulesCrud, faqs } from "@/lib/data/rules";
import { MemberGuard } from "@/components/MemberGuard";
import type { CommunityRule } from "@/lib/types";

export default function RulesPage() {
  return (
    <MemberGuard>
      <RulesContent />
    </MemberGuard>
  );
}

function RulesContent() {
  const [rules, setRules] = useState<CommunityRule[]>(mockRules);
  const [openFaq, setOpenFaq] = useState<string | null>(faqs[0]?.id ?? null);

  useEffect(() => {
    rulesCrud.fetchAll(mockRules).then(setRules);
  }, []);

  return (
    <div className="section-padding py-16 sm:py-24">
      <div className="max-w-6xl mx-auto">
        <SectionHeading eyebrow="The Code" title="Community Rules" description="Simple, non-negotiable standards that keep King Warriors a place worth being part of." />

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {rules.map((r, i) => (
            <GlassCard
              key={r.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
            >
              <div className="flex items-center gap-3">
                <span className="font-display text-2xl text-gold-gradient">{String(r.order).padStart(2, "0")}</span>
                <ScrollText size={16} className="text-[var(--color-gold)]/50" />
              </div>
              <h3 className="font-display text-lg mt-3 text-[var(--color-ivory)]">{r.title}</h3>
              <p className="mt-2 text-sm text-[var(--color-ash)] leading-relaxed">{r.description}</p>
            </GlassCard>
          ))}
        </div>

        {/* FAQ */}
        <div className="mt-24 max-w-3xl mx-auto">
          <SectionHeading eyebrow="Questions" title="Frequently Asked Questions" align="left" />
          <div className="mt-10 space-y-3">
            {faqs.map((f) => {
              const open = openFaq === f.id;
              return (
                <GlassCard key={f.id} hover={false} className="p-0 overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(open ? null : f.id)}
                    className="w-full flex items-center justify-between gap-4 text-left px-6 py-5 cursor-pointer"
                  >
                    <span className="text-[var(--color-ivory)] font-medium">{f.question}</span>
                    <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.25 }}>
                      <ChevronDown size={18} className="text-[var(--color-gold-bright)] shrink-0" />
                    </motion.span>
                  </button>
                  <AnimatePresence initial={false}>
                    {open && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <p className="px-6 pb-5 text-sm text-[var(--color-ash)] leading-relaxed">{f.answer}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </GlassCard>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
