"use client";

import { PageHero } from "@/components/shared/PageHero";
import { Section, SectionHeader } from "@/components/shared/Section";
import { Eye, Target, History, Building2, Quote } from "lucide-react";
import { SafeImage } from "@/components/shared/SafeImage";
import { AnimatedSection, AnimatedStagger, AnimatedItem, GlowCard } from "@/components/motion/AnimatedSection";
import { PLACEHOLDER } from "@/lib/images";
import { useSettings } from "@/hooks/useSettings";

export default function AboutPage() {
  const { settings } = useSettings();
  const about = (settings.about_page || {}) as {
    history?: string; vision?: string; mission?: string;
    principal_name?: string; principal_message?: string;
    infrastructure?: Array<{ title: string; desc: string; image?: string }>;
  };
  const infra = about.infrastructure?.length ? about.infrastructure : [
    { title: "Smart Classrooms", desc: "Interactive panels and digital learning.", image: PLACEHOLDER.classroom },
    { title: "Science Labs", desc: "Fully equipped laboratories.", image: PLACEHOLDER.lab },
    { title: "Digital Library", desc: "10,000+ books and e-resources.", image: PLACEHOLDER.library },
    { title: "Sports Complex", desc: "Cricket, basketball, swimming.", image: PLACEHOLDER.sports },
  ];

  return (
    <>
      <PageHero
        title="About Our School"
        subtitle="25+ years of nurturing excellence, innovation, and character"
        backgroundImage={PLACEHOLDER.campus}
        align="left"
        breadcrumbs={[{ label: "About" }]}
      />
      <Section>
        <div className="grid gap-12 lg:grid-cols-2">
          <AnimatedSection>
            <GlowCard className="p-8">
              <div className="mb-3 flex items-center gap-2 text-primary">
                <History className="h-5 w-5" />
                <h2 className="text-2xl font-bold">Our History</h2>
              </div>
              <p className="leading-relaxed text-muted-foreground">
                {about.history || "Smart International School has been a leader in education for over 25 years."}
              </p>
            </GlowCard>
          </AnimatedSection>
          <AnimatedStagger className="grid gap-4 sm:grid-cols-2">
            <AnimatedItem>
              <GlowCard className="h-full p-6">
                <Eye className="mb-3 h-8 w-8 text-primary" />
                <h3 className="font-bold">Vision</h3>
                <p className="mt-2 text-sm text-muted-foreground">{about.vision || "Global leader in smart education."}</p>
              </GlowCard>
            </AnimatedItem>
            <AnimatedItem>
              <GlowCard className="h-full p-6">
                <Target className="mb-3 h-8 w-8 text-primary" />
                <h3 className="font-bold">Mission</h3>
                <p className="mt-2 text-sm text-muted-foreground">{about.mission || "Quality education through innovation."}</p>
              </GlowCard>
            </AnimatedItem>
          </AnimatedStagger>
        </div>
      </Section>

      <Section variant="muted">
        <AnimatedSection>
          <div className="relative overflow-hidden rounded-3xl border border-primary/10 bg-gradient-to-br from-primary/5 to-accent/5 p-8 md:p-12">
            <Quote className="absolute right-8 top-8 h-16 w-16 text-primary/10" />
            <h2 className="text-2xl font-bold md:text-3xl">Message from the Principal</h2>
            <p className="mt-5 max-w-3xl leading-relaxed text-muted-foreground md:text-lg">
              &ldquo;{about.principal_message || "Welcome to our school family."}&rdquo;
            </p>
            <p className="mt-6 font-semibold">— {about.principal_name || "Dr. S. Venkatesh"}, Principal</p>
          </div>
        </AnimatedSection>
      </Section>

      <Section variant="gradient">
        <SectionHeader
          eyebrow="Campus"
          title={<>World-Class <span className="gradient-text">Infrastructure</span></>}
          subtitle="Facilities designed for holistic development"
        />
        <AnimatedStagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {infra.map((item) => (
            <AnimatedItem key={item.title}>
              <GlowCard className="group overflow-hidden">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <SafeImage src={item.image} alt={item.title} fallback={PLACEHOLDER.campus} fill className="transition duration-700 group-hover:scale-110" />
                </div>
                <div className="p-5">
                  <Building2 className="mb-2 h-6 w-6 text-primary" />
                  <h3 className="font-bold">{item.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </GlowCard>
            </AnimatedItem>
          ))}
        </AnimatedStagger>
      </Section>
    </>
  );
}
