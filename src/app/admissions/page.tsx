"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { PageHero } from "@/components/shared/PageHero";
import { Section, SectionHeader } from "@/components/shared/Section";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  Download,
  FileText,
  ArrowRight,
  Sparkles,
  Clock,
  Shield,
  Phone,
  MessageCircle,
  CalendarDays,
} from "lucide-react";
import { EnquiryForm } from "@/components/forms/EnquiryForm";
import { AnimatedSection, AnimatedStagger, AnimatedItem, GlowCard } from "@/components/motion/AnimatedSection";
import { PLACEHOLDER } from "@/lib/images";
import { SCHOOL } from "@/lib/constants";
import { useSettings } from "@/hooks/useSettings";

const steps = [
  "Submit online enquiry or visit our campus",
  "Attend counselling session with the admission team",
  "Complete application form with required documents",
  "Appear for interaction or assessment (if applicable)",
  "Pay admission fee and confirm your seat",
];

const documents = [
  "Birth Certificate",
  "Previous School Records / Report Card",
  "Passport Size Photos (4 copies)",
  "Address Proof (Aadhaar / Utility Bill)",
  "Transfer Certificate (if applicable)",
];

const highlights = [
  { icon: CalendarDays, label: "Academic Year", value: "2026–27" },
  { icon: Sparkles, label: "Seats Available", value: "Limited" },
  { icon: Clock, label: "Response Time", value: "Within 24 hrs" },
];

const perks = [
  "Free campus tour & counselling session",
  "Transparent fee structure with no hidden charges",
  "Scholarships for meritorious students",
  "Safe transport routes across the city",
];

export default function AdmissionsPage() {
  const { settings } = useSettings();
  const school = settings.school_info || SCHOOL;
  const brochureUrl = school.brochure_url || SCHOOL.brochure_url;

  return (
    <>
      <PageHero
        title="Admissions"
        subtitle="Join Smart International School — where every child discovers their potential"
        backgroundImage={PLACEHOLDER.admissions}
        breadcrumbs={[{ label: "Admissions" }]}
        align="left"
      />

      {/* Highlights strip */}
      <section className="relative z-10 -mt-8 pb-4">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid gap-4 sm:grid-cols-3">
            {highlights.map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.08 }}
              >
                <GlowCard className="flex items-center gap-4 p-5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/15 to-violet-500/15 text-primary">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{item.label}</p>
                    <p className="text-lg font-bold">{item.value}</p>
                  </div>
                </GlowCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Section>
        <div className="grid gap-12 lg:grid-cols-2">
          <AnimatedSection>
            <SectionHeader
              eyebrow="How It Works"
              title={<>Simple <span className="gradient-text">Admission Process</span></>}
              subtitle="Five easy steps from enquiry to enrollment"
              className="mb-8"
            />
            <ul className="space-y-4">
              {steps.map((step, i) => (
                <motion.li
                  key={step}
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07 }}
                  className="group flex gap-4 rounded-2xl border border-border/40 bg-card/50 p-4 transition hover:border-primary/20 hover:bg-primary/5"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-violet-600 text-sm font-bold text-white shadow-soft">
                    {i + 1}
                  </span>
                  <span className="pt-1.5 text-sm leading-relaxed text-muted-foreground group-hover:text-foreground">{step}</span>
                </motion.li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href={brochureUrl} download target="_blank" rel="noopener noreferrer">
                <Button className="rounded-xl shadow-lg shadow-primary/20">
                  <Download className="h-4 w-4" /> Download Brochure
                </Button>
              </a>
              <Link href="/courses">
                <Button variant="outline" className="rounded-xl">
                  View Courses <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.12}>
            <GlowCard className="h-full overflow-hidden">
              <div className="border-b border-border/50 bg-gradient-to-r from-primary/5 to-violet-500/5 px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold">Required Documents</h3>
                    <p className="text-xs text-muted-foreground">Keep these ready for a smooth admission</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <AnimatedStagger className="space-y-2.5">
                  {documents.map((d) => (
                    <AnimatedItem key={d}>
                      <div className="flex items-center gap-3 rounded-xl border border-border/30 bg-muted/30 px-4 py-3 text-sm transition hover:border-emerald-500/20 hover:bg-emerald-500/5">
                        <CheckCircle className="h-4 w-4 shrink-0 text-emerald-500" />
                        <span className="text-muted-foreground">{d}</span>
                      </div>
                    </AnimatedItem>
                  ))}
                </AnimatedStagger>
                <div className="mt-6 flex items-start gap-3 rounded-xl bg-amber-500/10 p-4 text-sm text-amber-800 dark:text-amber-200">
                  <Shield className="mt-0.5 h-4 w-4 shrink-0" />
                  <p>Original documents must be presented for verification at the time of admission.</p>
                </div>
              </div>
            </GlowCard>
          </AnimatedSection>
        </div>
      </Section>

      {/* Quick Enquiry — premium split layout */}
      <Section variant="gradient" id="quick-enquiry">
        <div className="grid items-start gap-10 lg:grid-cols-[1fr_1.15fr] lg:gap-14">
          <AnimatedSection>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
              <Sparkles className="h-3.5 w-3.5" /> Quick Enquiry
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
              Start Your <span className="gradient-text">Admission Journey</span>
            </h2>
            <p className="mt-4 max-w-md leading-relaxed text-muted-foreground">
              Fill in the form and our admission counsellor will reach out with class availability, fee details, and campus visit slots.
            </p>

            <ul className="mt-8 space-y-3">
              {perks.map((perk, i) => (
                <motion.li
                  key={perk}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  className="flex items-center gap-3 text-sm"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/10">
                    <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                  </span>
                  {perk}
                </motion.li>
              ))}
            </ul>

            <div className="mt-10 grid gap-3 sm:grid-cols-2">
              <a
                href={`tel:${(school.phone || SCHOOL.phone).replace(/\s/g, "")}`}
                className="flex items-center gap-3 rounded-2xl border border-border/50 bg-card/80 p-4 transition hover:border-primary/30 hover:shadow-soft"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Phone className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Call Admissions</p>
                  <p className="text-sm font-semibold">{school.phone || SCHOOL.phone}</p>
                </div>
              </a>
              <a
                href={`https://wa.me/${school.whatsapp || SCHOOL.whatsapp}?text=Hello,%20I%20have%20an%20admission%20enquiry`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-2xl border border-border/50 bg-card/80 p-4 transition hover:border-emerald-500/30 hover:shadow-soft"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
                  <MessageCircle className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">WhatsApp Us</p>
                  <p className="text-sm font-semibold">Chat with counsellor</p>
                </div>
              </a>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.15} once={false}>
            <div className="relative">
              <div className="pointer-events-none absolute -inset-1 rounded-[1.75rem] bg-gradient-to-br from-primary/30 via-violet-500/20 to-accent/20 blur-sm" />
              <GlowCard className="relative overflow-hidden border-primary/10 p-0">
                <div className="border-b border-border/50 bg-gradient-to-r from-primary/8 to-violet-500/8 px-6 py-5 md:px-8">
                  <h3 className="text-lg font-bold">Admission Enquiry Form</h3>
                  <p className="mt-1 text-sm text-muted-foreground">All fields marked * are required</p>
                </div>
                <div className="p-6 md:p-8">
                  <EnquiryForm />
                </div>
              </GlowCard>
            </div>
          </AnimatedSection>
        </div>
      </Section>
    </>
  );
}
