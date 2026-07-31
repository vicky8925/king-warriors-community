"use client";

import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Crest } from "@/components/ui/Crest";
import { EmberBackground } from "@/components/ui/EmberBackground";

export function Hero() {
  return (
    <section id="join" className="relative min-h-[92vh] flex items-center overflow-hidden">
      {/* Ambient background layers */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(201,162,39,0.14),transparent)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_85%_90%,rgba(139,105,20,0.12),transparent)]" />
      <EmberBackground />

      <div className="section-padding relative z-10 w-full py-28 sm:py-32">
        <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <Crest size={72} animate />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="eyebrow mt-6 flex items-center gap-2"
          >
            <ShieldCheck size={13} /> A Premium Leadership Community
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65, duration: 0.7, ease: "easeOut" }}
            className="font-display mt-6 text-[2.6rem] leading-[1.08] sm:text-6xl md:text-7xl text-[var(--color-ivory)]"
          >
            King <span className="text-gold-gradient">Warriors</span>
            <br className="hidden sm:block" /> Community
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.85, duration: 0.6 }}
            className="mt-6 text-lg sm:text-xl text-[var(--color-gold-soft)] font-display tracking-wide"
          >
            Together We Rise. Together We Lead.
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.6 }}
            className="mt-5 max-w-xl text-[var(--color-ash)] leading-relaxed"
          >
            Ten thousand warriors. One shared standard. Join a community built on discipline, mentorship, and the
            belief that we rise fastest when we rise together.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.15, duration: 0.6 }}
            className="mt-9 flex flex-col sm:flex-row items-center gap-4"
          >
            <Button size="lg" onClick={() => (window.location.href = "/join")}>
              Join Community <ArrowRight size={17} />
            </Button>
            <Button
              size="lg"
              variant="secondary"
              onClick={() => document.getElementById("overview")?.scrollIntoView({ behavior: "smooth" })}
            >
              Explore the Community
            </Button>
          </motion.div>
        </div>
      </div>

      <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-[var(--color-void)] to-transparent" />
    </section>
  );
}
