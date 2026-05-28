"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { GraduationCap, Mail, MapPin, Phone, ArrowUpRight } from "lucide-react";
import { SCHOOL, QUICK_LINKS } from "@/lib/constants";
import { useSettings } from "@/hooks/useSettings";
import { AnimatedStagger, AnimatedItem } from "@/components/motion/AnimatedSection";

export function Footer() {
  const pathname = usePathname();
  const { settings } = useSettings();
  const school = settings.school_info || SCHOOL;
  if (pathname.startsWith("/admin") || pathname.startsWith("/portal")) return null;

  return (
    <footer className="relative overflow-hidden border-t border-primary/10 bg-slate-950 text-slate-300">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(245_72%_55%/0.15),transparent_60%)]" />
      <div className="pointer-events-none absolute -right-40 top-0 h-80 w-80 rounded-full bg-violet-600/10 blur-3xl" />

      <div className="container relative mx-auto grid gap-12 px-4 py-20 lg:grid-cols-4 lg:px-8">
        <AnimatedStagger className="space-y-5 lg:col-span-1">
          <AnimatedItem>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent text-white shadow-lg shadow-primary/30">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div>
                <p className="font-bold text-white">{school.name || SCHOOL.name}</p>
                <p className="text-sm text-slate-400">{school.tagline || SCHOOL.tagline}</p>
              </div>
            </div>
          </AnimatedItem>
          <AnimatedItem>
            <p className="text-sm leading-relaxed text-slate-400">
              Empowering students with smart education, modern infrastructure, and AI-powered support.
            </p>
          </AnimatedItem>
        </AnimatedStagger>

        <div>
          <h4 className="mb-5 text-sm font-semibold uppercase tracking-widest text-white">Quick Links</h4>
          <ul className="space-y-3 text-sm">
            {QUICK_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="group flex items-center gap-1 text-slate-400 transition hover:text-white">
                  {link.label}
                  <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition group-hover:opacity-100" />
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-5 text-sm font-semibold uppercase tracking-widest text-white">Contact</h4>
          <ul className="space-y-4 text-sm text-slate-400">
            <li className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              {school.address || SCHOOL.address}
            </li>
            <li className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-primary" />
              {school.phone || SCHOOL.phone}
            </li>
            <li className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-primary" />
              {school.email || SCHOOL.email}
            </li>
          </ul>
        </div>

        <div>
          <h4 className="mb-5 text-sm font-semibold uppercase tracking-widest text-white">Office Hours</h4>
          <p className="text-sm text-slate-400">Mon – Fri: 8:30 AM – 4:00 PM</p>
          <p className="mt-2 text-sm text-slate-400">Sat: 9:00 AM – 12:00 PM</p>
          <p className="mt-4 text-sm text-slate-500">Sunday: Closed</p>
        </div>
      </div>

      <div className="relative border-t border-white/5 py-8 text-center text-sm text-slate-500">
        <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          © {new Date().getFullYear()} {school.name || SCHOOL.name}. All rights reserved.
        </motion.p>
      </div>
    </footer>
  );
}
