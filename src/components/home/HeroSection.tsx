"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Play, Sparkles, Award, Users, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/hooks/useSettings";
import { PLACEHOLDER, resolveMediaUrl } from "@/lib/images";
import { BackgroundImage } from "@/components/shared/BackgroundImage";
import { heroItem, heroStagger } from "@/lib/motion";

export function HeroSection() {
  const { settings } = useSettings();
  const school = settings.school_info || {};
  const home = settings.home_page || {};

  return (
    <section className="relative min-h-[95vh] overflow-hidden">
      <motion.div
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-0"
      >
        <BackgroundImage
          src={resolveMediaUrl((home as { hero_image?: string }).hero_image, PLACEHOLDER.hero)}
          fallback={PLACEHOLDER.hero}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/75 via-primary/70 to-violet-950/78" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(255,255,255,0.15)_0%,transparent_60%)]" />
        <div className="absolute inset-0 pattern-dots opacity-25" />
      </motion.div>

      <div className="pointer-events-none absolute left-[10%] top-[20%] h-72 w-72 animate-float rounded-full bg-violet-400/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[15%] right-[8%] h-96 w-96 animate-float rounded-full bg-indigo-300/15 blur-3xl [animation-delay:3s]" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 animate-pulse-glow rounded-full bg-primary/10 blur-3xl" />

      <div className="container relative mx-auto flex min-h-[95vh] flex-col items-center justify-center px-4 py-28 text-center text-white lg:px-8">
        <motion.div variants={heroStagger} initial="hidden" animate="visible" className="max-w-5xl">
          <motion.span
            variants={heroItem}
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-5 py-2 text-sm font-medium backdrop-blur-md"
          >
            <Sparkles className="h-4 w-4 text-amber-300" />
            AI-Powered Smart Education Platform
          </motion.span>

          <motion.h1 variants={heroItem} className="text-balance text-4xl font-extrabold leading-[1.08] tracking-tight md:text-6xl lg:text-7xl">
            {home.hero_title || (
              <>
                Shape Tomorrow&apos;s{" "}
                <span className="bg-gradient-to-r from-white via-violet-200 to-fuchsia-200 bg-clip-text text-transparent">
                  Leaders
                </span>
              </>
            )}
          </motion.h1>

          <motion.p variants={heroItem} className="mx-auto mt-7 max-w-2xl text-lg leading-relaxed text-white/85 md:text-xl">
            {home.hero_subtitle || school.tagline || "Excellence in Education with world-class infrastructure"}
          </motion.p>

          <motion.div variants={heroItem} className="mt-12 flex flex-wrap items-center justify-center gap-4">
            <Link href="/admission-enquiry">
              <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.98 }}>
                <Button size="lg" className="h-14 rounded-2xl bg-white px-10 text-base text-primary shadow-2xl hover:bg-white/95">
                  Start Admission <ArrowRight className="h-4 w-4" />
                </Button>
              </motion.div>
            </Link>
            <Link href="/about">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                <Button size="lg" variant="secondary" className="h-14 rounded-2xl px-10 text-base">
                  <Play className="h-4 w-4" /> Explore Campus
                </Button>
              </motion.div>
            </Link>
          </motion.div>

          <motion.div variants={heroItem} className="mt-16 grid grid-cols-3 gap-3 sm:inline-grid sm:grid-cols-3 sm:gap-5">
            {[
              { icon: Award, label: "25+ Years" },
              { icon: Users, label: "2500+ Students" },
              { icon: BookOpen, label: "150+ Faculty" },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex flex-col items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-5 py-4 backdrop-blur-md transition hover:bg-white/15 sm:px-8"
              >
                <Icon className="h-5 w-5 text-amber-300" />
                <span className="text-xs font-bold sm:text-sm">{label}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 text-background">
        <svg viewBox="0 0 1440 80" preserveAspectRatio="none" className="block h-14 w-full md:h-20">
          <path fill="currentColor" d="M0,40 C480,80 960,0 1440,40 L1440,80 L0,80 Z" />
        </svg>
      </div>
    </section>
  );
}
