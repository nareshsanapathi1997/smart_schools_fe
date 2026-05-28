"use client";

import { motion } from "framer-motion";
import { Play } from "lucide-react";
import { useSettings } from "@/hooks/useSettings";
import { VideoBlock } from "@/components/shared/VideoBlock";
import { Section } from "@/components/shared/Section";
import { AnimatedSection } from "@/components/motion/AnimatedSection";
import { slideLeft, slideRight } from "@/lib/motion";
import { DEMO_VIDEO, PLACEHOLDER } from "@/lib/images";

export function VideoIntroSection() {
  const { settings } = useSettings();
  const home = settings.home_page || {};

  return (
    <Section variant="gradient">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <AnimatedSection>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={slideLeft}>
            <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary">
              <Play className="h-3.5 w-3.5" /> Virtual Tour
            </span>
            <h2 className="text-3xl font-bold md:text-4xl lg:text-5xl">
              Experience Our <span className="gradient-text">Smart Campus</span>
            </h2>
            <p className="mt-5 leading-relaxed text-muted-foreground md:text-lg">
              Take a virtual tour of our smart classrooms, science labs, digital library, sports facilities, and AI-enabled learning environment.
            </p>
            <div className="mt-8 flex flex-wrap gap-6">
              {["Smart Classrooms", "Digital Labs", "Sports Arena"].map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm font-medium">
                  <span className="h-2 w-2 rounded-full bg-gradient-to-r from-primary to-accent animate-pulse-glow" />
                  {item}
                </div>
              ))}
            </div>
          </motion.div>
        </AnimatedSection>

        <AnimatedSection delay={0.15}>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={slideRight}
            className="gradient-border rounded-3xl p-1"
          >
            <div className="overflow-hidden rounded-[22px] shadow-premium">
              <VideoBlock
                url={home.video_url || DEMO_VIDEO}
                thumbnail={home.video_thumbnail || PLACEHOLDER.videoThumb}
                title="Smart School Campus Tour"
              />
            </div>
          </motion.div>
        </AnimatedSection>
      </div>
    </Section>
  );
}
