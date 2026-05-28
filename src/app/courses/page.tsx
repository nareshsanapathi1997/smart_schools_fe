"use client";

import Link from "next/link";
import { useDeferredValue, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { PageHero } from "@/components/shared/PageHero";
import { Input } from "@/components/ui/input";
import { BookOpen } from "lucide-react";
import { SafeImage } from "@/components/shared/SafeImage";
import { AnimatedStagger, AnimatedItem, GlowCard } from "@/components/motion/AnimatedSection";
import { PLACEHOLDER } from "@/lib/images";
import api from "@/lib/api";
import { cachedFetch } from "@/lib/request-cache";

import { useLookups } from "@/hooks/useLookups";

interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  class_level: string;
  fee_structure: { annual?: string };
  duration: string;
  image_url?: string;
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");
  const deferredSearch = useDeferredValue(search);

  useEffect(() => {
    const params = {
      search: deferredSearch || undefined,
      class: filter || undefined,
    };
    const cacheKey = `courses/list:${filter}:${deferredSearch}`;

    cachedFetch(
      cacheKey,
      () => api.get("/courses", { params }).then((res) => res.data.data || []),
      60_000
    )
      .then(setCourses)
      .catch(() => setCourses([]));
  }, [deferredSearch, filter]);

  const { options: classOptions } = useLookups("course_class");
  const filters = ["", ...classOptions.map((o) => o.value)];
  const filterLabels: Record<string, string> = {
    "": "All Classes",
    ...Object.fromEntries(classOptions.map((o) => [o.value, o.label])),
  };
  if (filters.length === 1) {
    filters.push("Primary", "Middle", "Secondary", "Senior");
    filterLabels.Primary = "Primary";
    filterLabels.Middle = "Middle";
    filterLabels.Secondary = "Secondary";
    filterLabels.Senior = "Senior";
  }

  return (
    <>
      <PageHero
        title="Courses & Classes"
        subtitle="Explore our comprehensive academic programs"
        backgroundImage={PLACEHOLDER.course}
        breadcrumbs={[{ label: "Courses" }]}
      />
      <section className="container mx-auto px-4 py-16 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10 flex flex-wrap items-center gap-4"
        >
          <Input
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs rounded-2xl"
          />
          <div className="flex flex-wrap gap-2">
            {filters.map((f) => (
              <button
                key={f || "all"}
                type="button"
                onClick={() => setFilter(f)}
                className={`relative rounded-full px-5 py-2.5 text-sm font-medium transition-colors ${
                  filter === f ? "text-white" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {filter === f && (
                  <motion.span
                    layoutId="course-filter"
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-primary to-violet-600"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{filterLabels[f]}</span>
              </button>
            ))}
          </div>
        </motion.div>

        <AnimatedStagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {courses.map((c) => (
            <AnimatedItem key={c.id}>
              <Link href={`/courses/${c.slug}`}>
                <GlowCard className="group h-full">
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <SafeImage src={c.image_url} alt={c.title} fallback={PLACEHOLDER.course} fill className="object-cover transition duration-700 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  </div>
                  <div className="p-4">
                    <BookOpen className="mb-2 h-6 w-6 text-primary" />
                    <h3 className="text-base font-bold">{c.title}</h3>
                    <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">{c.description}</p>
                    <div className="mt-3 flex justify-between border-t border-border/50 pt-3 text-sm">
                      <span className="text-muted-foreground">{c.duration}</span>
                      <span className="font-semibold text-primary">{c.fee_structure?.annual || "Contact us"}</span>
                    </div>
                  </div>
                </GlowCard>
              </Link>
            </AnimatedItem>
          ))}
        </AnimatedStagger>

        {!courses.length && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-20 text-center text-muted-foreground">
            No courses found. Try adjusting your search.
          </motion.p>
        )}
      </section>
    </>
  );
}
