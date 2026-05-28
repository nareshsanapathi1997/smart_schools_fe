"use client";

import { motion } from "framer-motion";
import { FileText } from "lucide-react";
import { AnimatedSection, GlowCard } from "@/components/motion/AnimatedSection";

const sections = [
  {
    title: "Acceptance of Terms",
    body: "By accessing Smart International School website, you agree to these terms and conditions.",
  },
  {
    title: "Use of Website",
    body: "This website is for informational purposes. Content may be updated without notice. Unauthorized use is prohibited.",
  },
  {
    title: "Admission Terms",
    body: "Admission is subject to eligibility, availability of seats, and completion of required documentation and fees.",
  },
  {
    title: "AI Chatbot",
    body: "AI responses are for general guidance. For official information, please contact the school administration directly.",
  },
];

export function TermsContent() {
  return (
    <section className="container mx-auto max-w-3xl px-4 py-16 lg:px-8">
      <AnimatedSection>
        <div className="mb-10 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <FileText className="h-7 w-7 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Last updated: May 2026</p>
            <p className="text-muted-foreground">Please read these terms carefully</p>
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
