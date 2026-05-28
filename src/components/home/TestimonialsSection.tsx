"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { Section, SectionHeader } from "@/components/shared/Section";
import { SafeImage } from "@/components/shared/SafeImage";
import { GlowCard } from "@/components/motion/AnimatedSection";
import { TestimonialSkeleton } from "@/components/home/HomeSectionSkeleton";
import { testimonialFallback } from "@/lib/images";
import { FALLBACK_TESTIMONIALS, loadHomeSection } from "@/lib/home-fallbacks";
import api from "@/lib/api";

interface Testimonial {
  id: string;
  name: string;
  role: string;
  content: string;
  rating: number;
  image_url?: string;
}

export function TestimonialsSection() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(0);

  useEffect(() => {
    loadHomeSection<Testimonial>(
      () => api.get("/cms/testimonials").then((r) => r.data.data || []),
      () => api.get("/cms/testimonials").then((r) => r.data.data || []),
      FALLBACK_TESTIMONIALS,
      3
    )
      .then(setItems)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (items.length <= 1) return;
    const t = setInterval(() => setActive((a) => (a + 1) % items.length), 5000);
    return () => clearInterval(t);
  }, [items.length]);

  return (
    <Section variant="muted">
      <SectionHeader
        eyebrow="Testimonials"
        title={<>What Parents <span className="gradient-text">Say</span></>}
        subtitle="Real stories from our school community"
      />
      {loading ? (
        <TestimonialSkeleton />
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
          {items.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              <GlowCard className={i === active ? "ring-2 ring-primary/30 shadow-glow" : ""}>
                <div className="relative p-6">
                  <Quote className="absolute right-5 top-5 h-10 w-10 text-primary/10" />
                  <div className="mb-5 flex items-center gap-3">
                    <div className="relative h-14 w-14 overflow-hidden rounded-2xl ring-2 ring-primary/20">
                      <SafeImage src={t.image_url} alt={t.name} fallback={testimonialFallback(i)} fill className="object-cover" />
                    </div>
                    <div>
                      <p className="font-bold">{t.name}</p>
                      <p className="text-xs text-primary">{t.role}</p>
                    </div>
                  </div>
                  <div className="mb-3 flex gap-0.5">
                    {Array.from({ length: t.rating || 5 }).map((_, j) => (
                      <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">&ldquo;{t.content}&rdquo;</p>
                </div>
              </GlowCard>
            </motion.div>
          ))}
        </div>
      )}
    </Section>
  );
}
