"use client";

import { motion } from "framer-motion";
import { Shield } from "lucide-react";
import { AnimatedSection, GlowCard } from "@/components/motion/AnimatedSection";

const sections = [
  {
    title: "Information We Collect",
    body: "We collect information you provide through admission enquiries, contact forms, newsletter subscriptions, and AI chatbot interactions.",
  },
  {
    title: "How We Use Information",
    body: "Your data is used to process admissions, respond to queries, improve our services, and send relevant school updates.",
  },
  {
    title: "Data Security",
    body: "We implement industry-standard security measures including encryption, secure authentication, and access controls.",
  },
  {
    title: "Contact",
    body: "For privacy concerns, contact info@smartschool.edu",
  },
];

export function PrivacyContent() {
  return (
    <section className="container mx-auto max-w-3xl px-4 py-16 lg:px-8">
      <AnimatedSection>
        <div className="mb-10 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <Shield className="h-7 w-7 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Last updated: May 2026</p>
            <p className="text-muted-foreground">Your privacy matters to us</p>
          </div>
        </div>
      </AnimatedSection>

      <div className="space-y-4">
        {sections.map((section, i) => (
          <AnimatedSection key={section.title} delay={i * 0.08}>
            <GlowCard className="p-6 md:p-8">
              <motion.h2
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="text-xl font-bold"
              >
                {section.title}
              </motion.h2>
              <p className="mt-3 leading-relaxed text-muted-foreground">{section.body}</p>
            </GlowCard>
          </AnimatedSection>
        ))}
      </div>
    </section>
  );
}
