"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Award, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SafeImage } from "@/components/shared/SafeImage";
import { Section, SectionHeader } from "@/components/shared/Section";
import { AnimatedStagger, AnimatedItem, GlowCard } from "@/components/motion/AnimatedSection";
import { HomeSectionSkeleton } from "@/components/home/HomeSectionSkeleton";
import { PLACEHOLDER } from "@/lib/images";
import { FALLBACK_ACHIEVEMENTS, loadHomeSection } from "@/lib/home-fallbacks";
import api from "@/lib/api";

interface Achievement {
  id: string;
  title: string;
  year?: number;
  image_url?: string;
}

export function AchievementsPreview() {
  const [items, setItems] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHomeSection<Achievement>(
      () => api.get("/cms/achievements", { params: { featured: "true", limit: 4 } }).then((r) => r.data.data || []),
      () => api.get("/cms/achievements", { params: { limit: 4 } }).then((r) => r.data.data || []),
      FALLBACK_ACHIEVEMENTS,
      4
    )
      .then(setItems)
      .finally(() => setLoading(false));
  }, []);

  return (
    <Section variant="muted">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <SectionHeader
          eyebrow="Excellence"
          title={<>Top <span className="gradient-text">Achievements</span></>}
          subtitle="Celebrating milestones that define our legacy"
          centered={false}
          className="mb-0"
        />
        <Link href="/results">
          <Button variant="outline" className="rounded-2xl">
            View All <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
      {loading ? (
        <HomeSectionSkeleton />
      ) : (
        <AnimatedStagger resetKey={items.map((a) => a.id).join("-")} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((a) => (
            <AnimatedItem key={a.id}>
              <GlowCard className="group h-full">
                <div className="relative aspect-video overflow-hidden">
                  <SafeImage src={a.image_url} alt={a.title} fallback={PLACEHOLDER.achievement} fill className="object-cover transition duration-700 group-hover:scale-105" />
                </div>
                <div className="flex items-start gap-3 p-5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                    <Award className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">{a.title}</p>
                    <p className="text-sm text-muted-foreground">{a.year || "—"}</p>
                  </div>
                </div>
              </GlowCard>
            </AnimatedItem>
          ))}
        </AnimatedStagger>
      )}
    </Section>
  );
}
