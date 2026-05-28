"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, Loader2, Mail, Phone, GraduationCap, Briefcase } from "lucide-react";
import { PageHero } from "@/components/shared/PageHero";
import { SafeImage } from "@/components/shared/SafeImage";
import { Button } from "@/components/ui/button";
import { GlowCard, AnimatedSection } from "@/components/motion/AnimatedSection";
import { PLACEHOLDER, facultyFallback } from "@/lib/images";
import api from "@/lib/api";
import { cachedFetch } from "@/lib/request-cache";

interface FacultyMember {
  id: string;
  name: string;
  slug: string;
  designation: string;
  department: string;
  qualification: string;
  experience: string;
  bio?: string;
  image_url?: string;
  email?: string;
  phone?: string;
}

export default function FacultyDetailPage() {
  const params = useParams();
  const slug = String(params.slug || "");
  const [member, setMember] = useState<FacultyMember | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    cachedFetch(
      `faculty/detail:${slug}`,
      () => api.get(`/faculty/${slug}`).then((r) => r.data.data as FacultyMember),
      300_000
    )
      .then(setMember)
      .catch(() => {
        setMember(null);
        setNotFound(true);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" /> Loading profile...
      </div>
    );
  }

  if (notFound || !member) {
    return (
      <section className="container mx-auto px-4 py-24 text-center lg:px-8">
        <h1 className="text-2xl font-bold">Faculty member not found</h1>
        <Link href="/faculty" className="mt-6 inline-block">
          <Button className="rounded-2xl"><ArrowLeft className="h-4 w-4" /> Back to Faculty</Button>
        </Link>
      </section>
    );
  }

  return (
    <>
      <PageHero
        title={member.name}
        subtitle={`${member.designation} • ${member.department}`}
        backgroundImage={member.image_url || PLACEHOLDER.faculty}
        breadcrumbs={[{ label: "Faculty", href: "/faculty" }, { label: member.name }]}
        align="left"
      />
      <section className="container mx-auto px-4 py-16 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[320px_1fr]">
          <AnimatedSection>
            <GlowCard className="overflow-hidden">
              <div className="relative aspect-[4/5]">
                <SafeImage src={member.image_url} alt={member.name} fallback={facultyFallback(0)} fill className="object-cover object-top" />
              </div>
              <div className="space-y-3 p-6">
                {member.email && (
                  <a href={`mailto:${member.email}`} className="flex items-center gap-2 text-sm text-primary hover:underline">
                    <Mail className="h-4 w-4" /> {member.email}
                  </a>
                )}
                {member.phone && (
                  <a href={`tel:${member.phone}`} className="flex items-center gap-2 text-sm text-primary hover:underline">
                    <Phone className="h-4 w-4" /> {member.phone}
                  </a>
                )}
              </div>
            </GlowCard>
          </AnimatedSection>
          <AnimatedSection delay={0.1}>
            <div className="grid gap-4 sm:grid-cols-2">
              <GlowCard className="p-5">
                <GraduationCap className="mb-2 h-6 w-6 text-primary" />
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Qualification</p>
                <p className="mt-1 font-semibold">{member.qualification || "—"}</p>
              </GlowCard>
              <GlowCard className="p-5">
                <Briefcase className="mb-2 h-6 w-6 text-primary" />
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Experience</p>
                <p className="mt-1 font-semibold">{member.experience || "—"}</p>
              </GlowCard>
            </div>
            {member.bio && (
              <GlowCard className="mt-6 p-6">
                <h2 className="text-xl font-bold">About</h2>
                <p className="mt-4 leading-relaxed text-muted-foreground">{member.bio}</p>
              </GlowCard>
            )}
            <Link href="/faculty" className="mt-8 inline-block">
              <Button variant="outline" className="rounded-xl"><ArrowLeft className="h-4 w-4" /> All Faculty</Button>
            </Link>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
