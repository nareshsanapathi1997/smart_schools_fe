"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BookOpen, ArrowRight } from "lucide-react";
import { Section, SectionHeader } from "@/components/shared/Section";
import { SafeImage } from "@/components/shared/SafeImage";
import { Button } from "@/components/ui/button";
import { AnimatedStagger, AnimatedItem, GlowCard } from "@/components/motion/AnimatedSection";
import { HomeSectionSkeleton } from "@/components/home/HomeSectionSkeleton";
import { PLACEHOLDER } from "@/lib/images";
import { FALLBACK_COURSES, loadHomeSection } from "@/lib/home-fallbacks";
import api from "@/lib/api";

interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  fee_structure?: { annual?: string };
  image_url?: string;
}

export function FeaturedCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHomeSection<Course>(
      () => api.get("/courses", { params: { featured: "true", limit: 4 } }).then((r) => r.data.data || []),
      () => api.get("/courses", { params: { limit: 4 } }).then((r) => r.data.data || []),
      FALLBACK_COURSES,
      4
    )
      .then(setCourses)
      .finally(() => setLoading(false));
  }, []);

  return (
    <Section variant="gradient">
      <SectionHeader
        eyebrow="Academics"
        title={<>Featured <span className="gradient-text">Courses</span></>}
        subtitle="Comprehensive programs designed for every stage of learning"
      />
      {loading ? (
        <HomeSectionSkeleton />
      ) : (
        <AnimatedStagger resetKey={courses.map((c) => c.id).join("-")} className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {courses.map((c) => (
            <AnimatedItem key={c.id}>
              <Link href={`/courses/${c.slug}`}>
                <GlowCard className="group h-full">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <SafeImage src={c.image_url} alt={c.title} fallback={PLACEHOLDER.course} fill className="object-cover transition duration-700 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-60 transition-opacity group-hover:opacity-80" />
                    <div className="absolute bottom-4 left-4 flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-md">
                      <BookOpen className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold transition-colors group-hover:text-primary">{c.title}</h3>
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{c.description}</p>
                    <p className="mt-3 font-semibold text-primary">{c.fee_structure?.annual || "Contact us"}</p>
                  </div>
                </GlowCard>
              </Link>
            </AnimatedItem>
          ))}
        </AnimatedStagger>
      )}
      <div className="mt-12 text-center">
        <Link href="/courses">
          <Button variant="outline" size="lg" className="rounded-2xl">
            View All Courses <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </Section>
  );
}
