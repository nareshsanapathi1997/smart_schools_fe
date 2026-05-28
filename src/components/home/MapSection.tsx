"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Navigation } from "lucide-react";
import { SCHOOL } from "@/lib/constants";
import { AnimatedSection } from "@/components/motion/AnimatedSection";
import { Button } from "@/components/ui/button";

const MAP_SRC =
  "https://maps.google.com/maps?q=Hyderabad+Telangana&t=&z=13&ie=UTF8&iwloc=&output=embed";

export function MapSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShowMap(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="container mx-auto px-4 pb-16 lg:px-8">
      <AnimatedSection>
        <div className="overflow-hidden rounded-3xl border border-border/50 shadow-premium">
          <div ref={containerRef} className="relative">
            <motion.div
              initial={{ scale: 1.05, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              {showMap ? (
                <iframe
                  title="School Location"
                  src={MAP_SRC}
                  className="h-[420px] w-full border-0 grayscale-[30%] transition-all duration-700 hover:grayscale-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              ) : (
                <div className="flex h-[420px] w-full items-center justify-center bg-muted/30">
                  <MapPin className="h-8 w-8 text-muted-foreground/50" />
                </div>
              )}
            </motion.div>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background/80 to-transparent" />
          </div>
          <div className="glass-card flex flex-col items-center gap-4 p-8 text-center md:flex-row md:justify-between md:text-left">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-lg font-semibold">{SCHOOL.name}</p>
                <p className="text-sm text-muted-foreground">{SCHOOL.address}</p>
              </div>
            </div>
            <a
              href={`https://maps.google.com/?q=${encodeURIComponent(SCHOOL.address)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button className="rounded-2xl">
                Get Directions <Navigation className="h-4 w-4" />
              </Button>
            </a>
          </div>
        </div>
      </AnimatedSection>
    </section>
  );
}
