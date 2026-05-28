"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { PageHero } from "@/components/shared/PageHero";
import { SectionHeader } from "@/components/shared/Section";
import { Award, TrendingUp, Trophy } from "lucide-react";
import { SafeImage } from "@/components/shared/SafeImage";
import { AnimatedStagger, AnimatedItem, GlowCard } from "@/components/motion/AnimatedSection";
import { FilterPills } from "@/components/motion/FilterPills";
import { PLACEHOLDER } from "@/lib/images";
import api from "@/lib/api";
import { cachedFetch } from "@/lib/request-cache";

const PassRateChart = dynamic(
  () => import("@/components/results/PassRateChart").then((m) => ({ default: m.PassRateChart })),
  { ssr: false, loading: () => <div className="h-72 min-h-[288px] animate-pulse rounded-2xl bg-muted/50" /> }
);

interface Achievement {
  id: string;
  title: string;
  student_name?: string;
  rank?: string;
  rank_order?: number;
  year?: number;
  image_url?: string;
  entry_type?: string;
}

const TOPPERS_PER_YEAR = 24;

export default function ResultsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [awards, setAwards] = useState<Achievement[]>([]);
  const [selectedYear, setSelectedYear] = useState("");

  useEffect(() => {
    cachedFetch(
      "cms/achievements/toppers",
      () =>
        api
          .get("/cms/achievements", { params: { entry_type: "topper", limit: 200 } })
          .then((r) => r.data.data || []),
      300_000
    )
      .then((data: Achievement[]) => {
        setAchievements(data);
        const years = Array.from(new Set(data.map((a) => a.year).filter((y): y is number => Boolean(y)))).sort(
          (a, b) => b - a
        );
        if (years.length) setSelectedYear(String(years[0]));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    cachedFetch(
      "cms/achievements/awards",
      () =>
        api
          .get("/cms/achievements", { params: { entry_type: "award", limit: 50 } })
          .then((r) => r.data.data || []),
      300_000
    )
      .then(setAwards)
      .catch(() => {});
  }, []);

  const yearTabs = useMemo(() => {
    const years = Array.from(new Set(achievements.map((a) => a.year).filter((y): y is number => Boolean(y)))).sort(
      (a, b) => b - a
    );
    return years.map(String);
  }, [achievements]);

  const yearToppers = useMemo(() => {
    if (!selectedYear) return [];
    const year = parseInt(selectedYear, 10);
    return achievements
      .filter((a) => a.year === year)
      .sort((a, b) => (a.rank_order || 999) - (b.rank_order || 999))
      .slice(0, TOPPERS_PER_YEAR);
  }, [achievements, selectedYear]);

  return (
    <>
      <PageHero
        title="Results & Achievements"
        subtitle="Celebrating academic excellence"
        backgroundImage={PLACEHOLDER.achievement}
        breadcrumbs={[{ label: "Results" }]}
      />
      <section className="container mx-auto px-4 py-16 lg:px-8">
        <SectionHeader
          eyebrow="Toppers"
          title={<>Student <span className="gradient-text">Highlights</span></>}
          subtitle={`Top ${TOPPERS_PER_YEAR} students by year — ordered by rank`}
          centered={false}
          className="mb-6 text-left"
        />

        {yearTabs.length > 0 && (
          <FilterPills
            options={yearTabs}
            value={selectedYear}
            onChange={setSelectedYear}
            layoutId="results-year-tab"
            className="mb-8"
          />
        )}

        {yearToppers.length > 0 ? (
          <AnimatedStagger className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {yearToppers.map((t, index) => (
              <AnimatedItem key={t.id}>
                <GlowCard className="group overflow-hidden">
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <SafeImage
                      src={t.image_url}
                      alt={t.student_name || t.title}
                      fallback={PLACEHOLDER.achievement}
                      fill
                      className="object-cover object-top transition duration-700 group-hover:scale-110"
                    />
                    <div className="absolute left-2 top-2 rounded-lg bg-white/90 px-2 py-0.5 text-[10px] font-bold text-primary backdrop-blur-md">
                      #{t.rank_order || index + 1}
                    </div>
                  </div>
                  <div className="p-3">
                    <Award className="mb-1.5 h-5 w-5 text-primary" />
                    <h3 className="truncate text-sm font-bold">{t.student_name || t.title}</h3>
                    <p className="truncate text-xs text-primary">{t.rank || t.title}</p>
                  </div>
                </GlowCard>
              </AnimatedItem>
            ))}
          </AnimatedStagger>
        ) : (
          <p className="py-12 text-center text-muted-foreground">
            No toppers found for {selectedYear || "this year"}. Add them from Admin → Achievements.
          </p>
        )}

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20"
        >
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Pass Rate Statistics</h2>
              <p className="text-sm text-muted-foreground">Consistent excellence year after year</p>
            </div>
          </div>
          <GlowCard className="p-6">
            <PassRateChart />
          </GlowCard>
        </motion.div>

        <div className="mt-20">
          <SectionHeader
            eyebrow="Recognition"
            title={<>Awards & <span className="gradient-text">Achievements</span></>}
            centered={false}
            className="mb-10 text-left"
          />
          <AnimatedStagger className="grid gap-4 sm:grid-cols-2">
            {awards.map((a) => (
              <AnimatedItem key={a.id}>
                <GlowCard className="flex items-center gap-4 p-5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-violet-500/10">
                    <Trophy className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <span className="font-medium">{a.title}</span>
                    {a.year ? (
                      <p className="text-xs text-muted-foreground">{a.year}</p>
                    ) : null}
                  </div>
                </GlowCard>
              </AnimatedItem>
            ))}
          </AnimatedStagger>
        </div>
      </section>
    </>
  );
}
