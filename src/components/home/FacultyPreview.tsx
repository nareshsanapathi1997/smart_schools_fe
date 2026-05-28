"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SafeImage } from "@/components/shared/SafeImage";
import { Section, SectionHeader } from "@/components/shared/Section";
import { AnimatedStagger, AnimatedItem, GlowCard } from "@/components/motion/AnimatedSection";
import { HomeSectionSkeleton } from "@/components/home/HomeSectionSkeleton";
import { facultyFallback } from "@/lib/images";
import { FALLBACK_FACULTY, loadHomeSection } from "@/lib/home-fallbacks";
import api from "@/lib/api";

interface FacultyMember {
  id: string;
  name: string;
  slug?: string;
  designation: string;
  department: string;
  qualification: string;
  image_url?: string;
}

export function FacultyPreview() {
  const [faculty, setFaculty] = useState<FacultyMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHomeSection<FacultyMember>(
      () => api.get("/faculty", { params: { featured: "true" } }).then((r) => r.data.data || []),
      () => api.get("/faculty").then((r) => r.data.data || []),
      FALLBACK_FACULTY,
      4
    )
      .then(setFaculty)
      .finally(() => setLoading(false));
  }, []);

  return (
    <Section>
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <SectionHeader
          eyebrow="Our Team"
          title={<>Expert <span className="gradient-text">Faculty</span></>}
          subtitle="Passionate educators shaping tomorrow's leaders"
          centered={false}
          className="mb-0"
        />
        <Link href="/faculty">
          <Button variant="outline" className="rounded-2xl">
            Meet All Faculty <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
      {loading ? (
        <HomeSectionSkeleton />
      ) : (
        <AnimatedStagger resetKey={faculty.map((f) => f.id).join("-")} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {faculty.map((f, i) => (
            <AnimatedItem key={f.id}>
              <Link href={f.slug ? `/faculty/${f.slug}` : "/faculty"}>
                <GlowCard className="group h-full">
                  <div className="relative aspect-square overflow-hidden">
                    <SafeImage src={f.image_url} alt={f.name} fallback={facultyFallback(i)} fill className="object-cover object-top transition duration-700 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                  </div>
                  <div className="p-5">
                    <p className="font-semibold group-hover:text-primary">{f.name}</p>
                    <p className="text-sm text-primary">{f.designation}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{f.qualification}</p>
                  </div>
                </GlowCard>
              </Link>
            </AnimatedItem>
          ))}
        </AnimatedStagger>
      )}
    </Section>
  );
}
