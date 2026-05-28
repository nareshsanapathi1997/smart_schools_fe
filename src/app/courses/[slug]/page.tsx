"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  GraduationCap,
  IndianRupee,
  Loader2,
  Sparkles,
} from "lucide-react";
import { PageHero } from "@/components/shared/PageHero";
import { SafeImage } from "@/components/shared/SafeImage";
import { Button } from "@/components/ui/button";
import { AnimatedSection, AnimatedStagger, AnimatedItem, GlowCard } from "@/components/motion/AnimatedSection";
import { PLACEHOLDER } from "@/lib/images";
import { parseJsonArray, type Course } from "@/lib/course-utils";
import api from "@/lib/api";
import { cachedFetch } from "@/lib/request-cache";

export default function CourseDetailPage() {
  const params = useParams();
  const slug = String(params.slug || "");
  const [course, setCourse] = useState<Course | null>(null);
  const [related, setRelated] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setNotFound(false);

    cachedFetch(
      `courses/detail:${slug}`,
      () => api.get(`/courses/${slug}`).then((r) => r.data.data as Course),
      300_000
    )
      .then((data) => {
        setCourse(data);
        return cachedFetch(
          `courses/related:${data.class_level}`,
          () => api.get("/courses").then((r) => (r.data.data || []) as Course[]),
          300_000
        );
      })
      .then((all) => {
        if (Array.isArray(all)) {
          setRelated(all.filter((c) => c.slug !== slug).slice(0, 4));
        }
      })
      .catch(() => {
        setCourse(null);
        setNotFound(true);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" /> Loading course...
      </div>
    );
  }

  if (notFound || !course) {
    return (
      <section className="container mx-auto px-4 py-24 text-center lg:px-8">
        <h1 className="text-2xl font-bold">Course not found</h1>
        <p className="mt-2 text-muted-foreground">This course may have been removed or is inactive.</p>
        <Link href="/courses" className="mt-6 inline-block">
          <Button className="rounded-2xl">
            <ArrowLeft className="h-4 w-4" /> Back to Courses
          </Button>
        </Link>
      </section>
    );
  }

  const subjects = parseJsonArray(course.subjects);
  const features = parseJsonArray(course.features);
  const fee = course.fee_structure?.annual || "Contact us for fees";

  return (
    <>
      <PageHero
        title={course.title}
        subtitle={course.description}
        backgroundImage={course.image_url || PLACEHOLDER.course}
        align="left"
        breadcrumbs={[
          { label: "Courses", href: "/courses" },
          { label: course.title },
        ]}
      />

      <section className="container mx-auto px-4 py-16 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-3">
          <div className="space-y-10 lg:col-span-2">
            <AnimatedSection>
              <GlowCard className="overflow-hidden p-0">
                <div className="relative aspect-[21/9] overflow-hidden">
                  <SafeImage
                    src={course.image_url}
                    alt={course.title}
                    fallback={PLACEHOLDER.course}
                    fill
                    className="object-cover"
                  />
                </div>
              </GlowCard>
            </AnimatedSection>

            <AnimatedSection>
              <div className="mb-4 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                <h2 className="text-2xl font-bold">Program Overview</h2>
              </div>
              <p className="leading-relaxed text-muted-foreground">
                {course.description || "Comprehensive academic program designed for holistic student development."}
              </p>
            </AnimatedSection>

            {features.length > 0 && (
              <AnimatedSection>
                <div className="mb-6 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <h2 className="text-2xl font-bold">Key Features</h2>
                </div>
                <AnimatedStagger className="grid gap-3 sm:grid-cols-2">
                  {features.map((feature) => (
                    <AnimatedItem key={feature}>
                      <div className="flex items-start gap-3 rounded-2xl border border-border/50 bg-card/50 p-4">
                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                        <span className="text-sm font-medium">{feature}</span>
                      </div>
                    </AnimatedItem>
                  ))}
                </AnimatedStagger>
              </AnimatedSection>
            )}

            {subjects.length > 0 && (
              <AnimatedSection>
                <div className="mb-4 flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-primary" />
                  <h2 className="text-2xl font-bold">Subjects Covered</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {subjects.map((subject) => (
                    <span
                      key={subject}
                      className="rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary"
                    >
                      {subject}
                    </span>
                  ))}
                </div>
              </AnimatedSection>
            )}

            {course.eligibility && (
              <AnimatedSection>
                <h2 className="mb-3 text-2xl font-bold">Eligibility</h2>
                <GlowCard className="p-5">
                  <p className="text-sm leading-relaxed text-muted-foreground">{course.eligibility}</p>
                </GlowCard>
              </AnimatedSection>
            )}
          </div>

          <aside className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="sticky top-24"
            >
              <GlowCard className="space-y-5 p-6">
                <h3 className="text-lg font-bold">Course Details</h3>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                      <GraduationCap className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Class Level</p>
                      <p className="font-semibold">{course.class_level || "All levels"}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Duration</p>
                      <p className="font-semibold">{course.duration || "Contact school"}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                      <IndianRupee className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Annual Fee</p>
                      <p className="font-semibold text-primary">{fee}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 border-t border-border/50 pt-5">
                  <Link href="/admissions" className="block">
                    <Button className="w-full rounded-2xl">
                      Apply for Admission <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/admission-enquiry" className="block">
                    <Button variant="outline" className="w-full rounded-2xl">
                      Enquire Now
                    </Button>
                  </Link>
                  <Link href="/courses" className="block">
                    <Button variant="ghost" className="w-full rounded-2xl">
                      <ArrowLeft className="h-4 w-4" /> All Courses
                    </Button>
                  </Link>
                </div>
              </GlowCard>
            </motion.div>
          </aside>
        </div>

        {related.length > 0 && (
          <div className="mt-20">
            <h2 className="mb-8 text-2xl font-bold">
              Other <span className="gradient-text">Programs</span>
            </h2>
            <AnimatedStagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((c) => (
                <AnimatedItem key={c.id}>
                  <Link href={`/courses/${c.slug}`}>
                    <GlowCard className="group h-full overflow-hidden">
                      <div className="relative aspect-[16/10] overflow-hidden">
                        <SafeImage
                          src={c.image_url}
                          alt={c.title}
                          fallback={PLACEHOLDER.course}
                          fill
                          className="object-cover transition duration-700 group-hover:scale-110"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold transition-colors group-hover:text-primary">{c.title}</h3>
                        <p className="mt-1 text-sm text-primary">
                          {c.fee_structure?.annual || "View details"}
                        </p>
                      </div>
                    </GlowCard>
                  </Link>
                </AnimatedItem>
              ))}
            </AnimatedStagger>
          </div>
        )}
      </section>
    </>
  );
}
