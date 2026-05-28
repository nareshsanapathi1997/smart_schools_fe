"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { PageHero } from "@/components/shared/PageHero";
import { Calendar, MapPin, ArrowRight } from "lucide-react";
import { SafeImage } from "@/components/shared/SafeImage";
import { AnimatedStagger, AnimatedItem, GlowCard } from "@/components/motion/AnimatedSection";
import { PLACEHOLDER } from "@/lib/images";
import { formatDate } from "@/lib/utils";
import api from "@/lib/api";
import { cachedFetch } from "@/lib/request-cache";
import type { SchoolEvent } from "@/lib/event-utils";

export default function EventsPage() {
  const [events, setEvents] = useState<SchoolEvent[]>([]);

  useEffect(() => {
    cachedFetch(
      "cms/events",
      () => api.get("/cms/events").then((r) => r.data.data || []),
      300_000
    )
      .then(setEvents)
      .catch(() => {});
  }, []);

  return (
    <>
      <PageHero
        title="Events & News"
        subtitle="Stay updated with upcoming events"
        backgroundImage={PLACEHOLDER.event}
        breadcrumbs={[{ label: "Events" }]}
      />
      <section className="container mx-auto px-4 py-16 lg:px-8">
        <AnimatedStagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {events.map((e) => (
            <AnimatedItem key={e.id}>
              <Link href={`/events/${e.slug}`}>
                <GlowCard className="group h-full overflow-hidden">
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <SafeImage
                      src={e.image_url}
                      alt={e.title}
                      fallback={PLACEHOLDER.event}
                      fill
                      className="object-cover transition duration-700 group-hover:scale-110"
                    />
                    <div className="absolute left-3 top-3 rounded-lg bg-white/90 px-2 py-0.5 text-[10px] font-bold text-primary backdrop-blur-md">
                      {formatDate(e.event_date)}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="line-clamp-2 text-base font-bold transition-colors group-hover:text-primary">
                      {e.title}
                    </h3>
                    <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-primary" />
                        {formatDate(e.event_date)}
                      </span>
                      {e.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-primary" />
                          <span className="line-clamp-1">{e.location}</span>
                        </span>
                      )}
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{e.description}</p>
                    <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary">
                      View details <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </GlowCard>
              </Link>
            </AnimatedItem>
          ))}
        </AnimatedStagger>

        {!events.length && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-20 text-center text-muted-foreground">
            No upcoming events. Check back soon.
          </motion.p>
        )}
      </section>
    </>
  );
}
