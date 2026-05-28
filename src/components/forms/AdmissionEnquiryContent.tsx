"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle, Clock, Phone, Sparkles } from "lucide-react";
import { GlowCard, AnimatedSection } from "@/components/motion/AnimatedSection";
import { EnquiryForm } from "@/components/forms/EnquiryForm";
import { SCHOOL } from "@/lib/constants";
import { useSettings } from "@/hooks/useSettings";

export function AdmissionEnquiryContent() {
  const { settings } = useSettings();
  const school = settings.school_info || SCHOOL;

  return (
    <section className="container mx-auto px-4 py-16 lg:px-8">
      <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[1fr_1.2fr]">
        <AnimatedSection>
          <Link href="/admissions" className="mb-6 inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
            <ArrowLeft className="h-4 w-4" /> Back to Admissions
          </Link>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <Sparkles className="h-3.5 w-3.5" /> Admission Enquiry
          </span>
          <h2 className="mt-4 text-2xl font-bold md:text-3xl">We&apos;re Here to Help</h2>
          <p className="mt-3 text-muted-foreground">
            Share your details and our team will respond within 24 hours with class availability and next steps.
          </p>
          <ul className="mt-8 space-y-3 text-sm">
            {["Personalised counselling session", "Campus tour scheduling", "Fee & scholarship information"].map((item, i) => (
              <motion.li key={item} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }} className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-500" /> {item}
              </motion.li>
            ))}
          </ul>
          <div className="mt-8 space-y-3 rounded-2xl border border-border/50 bg-muted/30 p-5 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4 text-primary" /> Office hours: Mon–Fri, 8:30 AM – 4:00 PM
            </div>
            <a href={`tel:${(school.phone || SCHOOL.phone).replace(/\s/g, "")}`} className="flex items-center gap-2 font-medium text-primary hover:underline">
              <Phone className="h-4 w-4" /> {school.phone || SCHOOL.phone}
            </a>
          </div>
        </AnimatedSection>

        <AnimatedSection delay={0.1} once={false}>
          <GlowCard className="overflow-hidden p-0">
            <div className="border-b border-border/50 bg-gradient-to-r from-primary/8 to-violet-500/8 px-6 py-5">
              <h3 className="font-bold">Enquiry Form</h3>
              <p className="text-sm text-muted-foreground">Secure & confidential</p>
            </div>
            <div className="p-6 md:p-8">
              <EnquiryForm />
            </div>
          </GlowCard>
        </AnimatedSection>
      </div>
    </section>
  );
}
