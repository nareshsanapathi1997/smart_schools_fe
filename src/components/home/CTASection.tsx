"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Trophy, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/shared/Section";

export function CTASection() {
  return (
    <Section variant="gradient" className="py-24">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative overflow-hidden rounded-4xl"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-violet-600 to-accent animate-gradient bg-[length:200%_200%]" />
        <div className="absolute inset-0 pattern-dots opacity-20" />
        <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-white/10 blur-3xl" />

        <div className="relative px-8 py-16 text-center text-white md:px-16 md:py-20">
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-md"
          >
            <Trophy className="h-8 w-8 text-amber-300" />
          </motion.div>
          <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-widest">
            <Sparkles className="h-3.5 w-3.5" /> Limited Seats
          </span>
          <h2 className="text-3xl font-extrabold md:text-5xl">Admissions Open 2026-27</h2>
          <p className="mx-auto mt-5 max-w-xl text-lg text-white/85">
            Join our community of achievers. Apply today and get AI-powered admission support.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link href="/admission-enquiry">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                <Button size="lg" className="h-13 rounded-2xl bg-white px-8 text-primary hover:bg-white/95">
                  Submit Enquiry <ArrowRight className="h-4 w-4" />
                </Button>
              </motion.div>
            </Link>
            <Link href="/admissions">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                <Button size="lg" variant="secondary" className="h-13 rounded-2xl px-8">
                  Admission Process
                </Button>
              </motion.div>
            </Link>
          </div>
        </div>
      </motion.div>
    </Section>
  );
}
