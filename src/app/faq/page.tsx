"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PageHero } from "@/components/shared/PageHero";
import { ChevronDown, HelpCircle } from "lucide-react";
import { AnimatedSection, GlowCard } from "@/components/motion/AnimatedSection";
import { cn } from "@/lib/utils";
import { PLACEHOLDER } from "@/lib/images";
import api from "@/lib/api";
import { cachedFetch } from "@/lib/request-cache";

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category?: string;
}

const fallbackFaqs: FAQ[] = [
  { id: "1", question: "What are the admission requirements?", answer: "Birth certificate, previous school records, passport photos, and address proof are required. Visit our Admissions page for details." },
  { id: "2", question: "What are the school timings?", answer: "School hours are 8:30 AM to 3:30 PM, Monday through Friday. Saturday activities run 9:00 AM to 12:00 PM." },
  { id: "3", question: "Is transport facility available?", answer: "Yes, we provide safe bus transport covering major areas of Hyderabad. Contact the office for route details." },
  { id: "4", question: "Do you have hostel facilities?", answer: "Yes, separate hostel facilities are available for boys and girls with 24/7 supervision and nutritious meals." },
  { id: "5", question: "What is the fee structure?", answer: "Fees vary by class level. Primary starts at ₹45,000/year. Visit Courses page or use our AI chatbot for detailed fee information." },
  { id: "6", question: "How can I track my admission enquiry?", answer: "Our admission team contacts you within 24 hours of enquiry submission. You can also call us directly." },
];

export default function FAQPage() {
  const [faqs, setFaqs] = useState<FAQ[]>(fallbackFaqs);
  const [open, setOpen] = useState<number | null>(0);

  useEffect(() => {
    cachedFetch(
      "chatbot/faqs",
      () => api.get("/chatbot/faqs").then((r) => r.data.data || []),
      300_000
    )
      .then((data) => {
        if (data.length) setFaqs(data);
      })
      .catch(() => {});
  }, []);

  return (
    <>
      <PageHero
        title="FAQ"
        subtitle="Frequently asked questions about admissions, academics, and campus life"
        backgroundImage={PLACEHOLDER.faq}
        breadcrumbs={[{ label: "FAQ" }]}
      />
      <section className="container mx-auto max-w-3xl px-4 py-16 lg:px-8">
        <AnimatedSection className="mb-8 flex items-center gap-3 rounded-2xl bg-primary/5 p-4">
          <HelpCircle className="h-5 w-5 text-primary" />
          <p className="text-sm text-muted-foreground">
            Can&apos;t find your answer? Use our AI chatbot or contact us directly.
          </p>
        </AnimatedSection>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <AnimatedSection key={faq.id} delay={i * 0.05}>
              <GlowCard className="overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpen(open === i ? null : i)}
                  className="flex w-full items-center justify-between p-5 text-left font-semibold transition-colors hover:text-primary"
                >
                  {faq.question}
                  <ChevronDown className={cn("h-5 w-5 shrink-0 transition-transform duration-300", open === i && "rotate-180")} />
                </button>
                <AnimatePresence initial={false}>
                  {open === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-border/40 px-5 pb-5 pt-3 text-sm leading-relaxed text-muted-foreground">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </GlowCard>
            </AnimatedSection>
          ))}
        </div>
      </section>
    </>
  );
}
