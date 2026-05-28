"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  Loader2,
  MapPin,
  Sparkles,
} from "lucide-react";
import { PageHero } from "@/components/shared/PageHero";
import { SafeImage } from "@/components/shared/SafeImage";
import { Button } from "@/components/ui/button";
import { AnimatedSection, AnimatedStagger, AnimatedItem, GlowCard } from "@/components/motion/AnimatedSection";
import { PLACEHOLDER } from "@/lib/images";
import { formatDate } from "@/lib/utils";
import { parseJsonArray, type SchoolEvent } from "@/lib/event-utils";
import api from "@/lib/api";
import { cachedFetch } from "@/lib/request-cache";

export default function EventDetailPage() {
  const params = useParams();
  const slug = String(params.slug || "");
  const [event, setEvent] = useState<SchoolEvent | null>(null);
  const [related, setRelated] = useState<SchoolEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setNotFound(false);

    cachedFetch(
      `events/detail:${slug}`,
      () => api.get(`/cms/events/${slug}`).then((r) => r.data.data as SchoolEvent),
      300_000
    )
      .then((data) => {
        setEvent(data);
        return cachedFetch(
          "cms/events",
          () => api.get("/cms/events").then((r) => (r.data.data || []) as SchoolEvent[]),
          300_000
        );
      })
      .then((all) => {
        if (Array.isArray(all)) {
          setRelated(all.filter((e) => e.slug !== slug).slice(0, 4));
        }
      })
      .catch(() => {
        setEvent(null);
        setNotFound(true);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" /> Loading event...
      </div>
    );
  }

  if (notFound || !event) {
    return (
      <section className="container mx-auto px-4 py-24 text-center lg:px-8">
        <h1 className="text-2xl font-bold">Event not found</h1>
        <p className="mt-2 text-muted-foreground">This event may have been removed or is no longer active.</p>
        <Link href="/events" className="mt-6 inline-block">
          <Button className="rounded-2xl">
            <ArrowLeft className="h-4 w-4" /> Back to Events
          </Button>
        </Link>
      </section>
    );
  }

  const highlights = parseJsonArray(event.highlights);
  const body = event.details || event.description || "";

  return (
    <>
      <PageHero
        title={event.title}
        subtitle={event.description}
        backgroundImage={event.image_url || PLACEHOLDER.event}
        align="left"
        breadcrumbs={[
          { label: "Events", href: "/events" },
          { label: event.title },
        ]}
      />

      <section className="container mx-auto px-4 py-16 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-3">
          <div className="space-y-10 lg:col-span-2">
            <AnimatedSection>
              <GlowCard className="overflow-hidden p-0">
                <div className="relative aspect-[21/9] overflow-hidden">
                  <SafeImage
                    src={event.image_url}
                    alt={event.title}
                    fallback={PLACEHOLDER.event}
                    fill
                    className="object-cover"
                  />
                </div>
              </GlowCard>
            </AnimatedSection>

            {body && (
              <AnimatedSection>
                <div className="mb-4 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <h2 className="text-2xl font-bold">About This Event</h2>
                </div>
                <p className="whitespace-pre-line leading-relaxed text-muted-foreground">{body}</p>
              </AnimatedSection>
            )}

            {highlights.length > 0 && (
              <AnimatedSection>
                <h2 className="mb-6 text-2xl font-bold">Event Highlights</h2>
                <AnimatedStagger className="grid gap-3 sm:grid-cols-2">
                  {highlights.map((item) => (
                    <AnimatedItem key={item}>
                      <div className="flex items-start gap-3 rounded-2xl border border-border/50 bg-card/50 p-4">
                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                        <span className="text-sm font-medium">{item}</span>
                      </div>
                    </AnimatedItem>
                  ))}
                </AnimatedStagger>
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
                <h3 className="text-lg font-bold">Event Info</h3>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Date</p>
                      <p className="font-semibold">{formatDate(event.event_date)}</p>
                    </div>
                  </div>

                  {event.end_date && (
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                        <Clock className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Ends</p>
                        <p className="font-semibold">{formatDate(event.end_date)}</p>
                      </div>
                    </div>
                  )}

                  {event.location && (
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                        <MapPin className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Venue</p>
                        <p className="font-semibold">{event.location}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-3 border-t border-border/50 pt-5">
                  <Link href="/contact" className="block">
                    <Button className="w-full rounded-2xl">
                      Contact Us <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/events" className="block">
                    <Button variant="outline" className="w-full rounded-2xl">
                      <ArrowLeft className="h-4 w-4" /> All Events
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
              More <span className="gradient-text">Events</span>
            </h2>
            <AnimatedStagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((e) => (
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
                      </div>
                      <div className="p-4">
                        <p className="text-xs text-primary">{formatDate(e.event_date)}</p>
                        <h3 className="mt-1 font-bold transition-colors group-hover:text-primary">{e.title}</h3>
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
