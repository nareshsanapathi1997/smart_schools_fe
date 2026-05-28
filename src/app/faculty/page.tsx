"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PageHero } from "@/components/shared/PageHero";
import { SafeImage } from "@/components/shared/SafeImage";
import { FilterPills } from "@/components/motion/FilterPills";
import { AnimatedStagger, AnimatedItem, GlowCard } from "@/components/motion/AnimatedSection";
import { PLACEHOLDER, facultyFallback } from "@/lib/images";
import api from "@/lib/api";
import { cachedFetch } from "@/lib/request-cache";

interface FacultyMember {
  id: string;
  slug: string;
  name: string;
  designation: string;
  department: string;
  qualification: string;
  experience: string;
  image_url?: string;
}

export default function FacultyPage() {
  const [faculty, setFaculty] = useState<FacultyMember[]>([]);
  const [dept, setDept] = useState("All");

  useEffect(() => {
    const params = { department: dept === "All" ? undefined : dept };
    cachedFetch(
      `faculty/list:${dept}`,
      () => api.get("/faculty", { params }).then((res) => res.data.data || []),
      300_000
    )
      .then(setFaculty)
      .catch(() => setFaculty([]));
  }, [dept]);

  const departments = ["All", ...Array.from(new Set(faculty.map((f) => f.department)))];

  return (
    <>
      <PageHero
        title="Our Faculty"
        subtitle="Experienced educators dedicated to student success"
        backgroundImage={PLACEHOLDER.faculty}
        breadcrumbs={[{ label: "Faculty" }]}
      />
      <section className="container mx-auto px-4 py-16 lg:px-8">
        <FilterPills options={departments} value={dept} onChange={setDept} className="mb-10" />

        <AnimatedStagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {faculty.map((f, i) => (
            <AnimatedItem key={f.id}>
              <Link href={`/faculty/${f.slug}`}>
                <GlowCard className="group overflow-hidden transition hover:ring-2 hover:ring-primary/20">
                <div className="relative aspect-[16/10] overflow-hidden">
                  <SafeImage src={f.image_url} alt={f.name} fallback={facultyFallback(i)} fill className="object-cover object-top transition duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                </div>
                <div className="p-4">
                  <h3 className="font-bold">{f.name}</h3>
                  <p className="text-sm text-primary">{f.designation} • {f.department}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{f.qualification}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{f.experience} experience</p>
                </div>
              </GlowCard>
              </Link>
            </AnimatedItem>
          ))}
        </AnimatedStagger>
      </section>
    </>
  );
}
