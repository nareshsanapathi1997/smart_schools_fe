"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight, Home } from "lucide-react";
import { PLACEHOLDER } from "@/lib/images";
import { BackgroundImage } from "@/components/shared/BackgroundImage";
import { cn } from "@/lib/utils";
import { heroItem, heroStagger } from "@/lib/motion";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeroProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  backgroundImage?: string;
  align?: "center" | "left";
}

export function PageHero({
  title,
  subtitle,
  breadcrumbs = [],
  backgroundImage,
  align = "center",
}: PageHeroProps) {
  const bg = backgroundImage || PLACEHOLDER.hero;

  return (
    <section className="relative overflow-hidden">
      <motion.div
        initial={{ scale: 1.08 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-0"
      >
        <BackgroundImage src={bg} fallback={PLACEHOLDER.hero} />
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/93 via-primary/88 to-violet-950/90" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(255,255,255,0.14)_0%,transparent_55%)]" />
        <div className="absolute inset-0 pattern-dots opacity-30" />
      </motion.div>

      <div className="pointer-events-none absolute -left-32 top-1/4 h-96 w-96 animate-pulse-glow rounded-full bg-violet-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 bottom-0 h-80 w-80 animate-float rounded-full bg-indigo-400/15 blur-3xl" />

      <div className="container relative mx-auto px-4 py-16 lg:px-8 lg:py-24">
        <motion.nav
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          aria-label="Breadcrumb"
          className={cn(
            "mb-8 flex flex-wrap items-center gap-1.5 text-sm text-white/75",
            align === "center" && "justify-center"
          )}
        >
          <Link href="/" className="flex items-center gap-1.5 transition hover:text-white">
            <Home className="h-4 w-4" />
            <span>Home</span>
          </Link>
          {breadcrumbs.map((item, i) => (
            <span key={i} className="flex items-center gap-1.5">
              <ChevronRight className="h-4 w-4 opacity-50" />
              {item.href ? (
                <Link href={item.href} className="transition hover:text-white">{item.label}</Link>
              ) : (
                <span className="font-medium text-white">{item.label}</span>
              )}
            </span>
          ))}
        </motion.nav>

        <motion.div
          variants={heroStagger}
          initial="hidden"
          animate="visible"
          className={cn(align === "center" && "text-center")}
        >
          <div className={cn("max-w-3xl", align === "center" && "mx-auto")}>
            <motion.span variants={heroItem} className="mb-5 inline-block rounded-full border border-white/20 bg-white/10 px-5 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-white/90 backdrop-blur-md">
              Premium Education
            </motion.span>
            <motion.h1 variants={heroItem} className="text-balance text-4xl font-extrabold tracking-tight text-white md:text-5xl lg:text-6xl">
              {title}
            </motion.h1>
            {subtitle && (
              <motion.p variants={heroItem} className="mt-5 text-lg leading-relaxed text-white/85 md:text-xl">
                {subtitle}
              </motion.p>
            )}
          </div>
        </motion.div>
      </div>

      <div className="relative -mb-px text-background">
        <svg viewBox="0 0 1440 60" preserveAspectRatio="none" className="block h-12 w-full md:h-16">
          <path
            fill="currentColor"
            d="M0,32 C360,60 720,0 1080,32 C1260,48 1380,40 1440,32 L1440,60 L0,60 Z"
          />
        </svg>
      </div>
    </section>
  );
}
