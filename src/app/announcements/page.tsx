"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Megaphone, Pin, Calendar, ArrowRight } from "lucide-react";
import { PageHero } from "@/components/shared/PageHero";
import { FilterPills } from "@/components/motion/FilterPills";
import { AnimatedSection, AnimatedStagger, AnimatedItem, GlowCard } from "@/components/motion/AnimatedSection";
import { PLACEHOLDER } from "@/lib/images";
import { formatDate } from "@/lib/utils";
import api from "@/lib/api";
import { cachedFetch } from "@/lib/request-cache";

interface Announcement {
  id: string;
  title: string;
  content?: string;
  type: string;
  is_pinned?: boolean;
  published_at: string;
  expires_at?: string | null;
}

const typeLabels: Record<string, string> = {
  general: "General",
  admission: "Admission",
  event: "Event",
  news: "News",
};

const typeStyles: Record<string, string> = {
  general: "bg-slate-500/10 text-slate-600",
  admission: "bg-primary/10 text-primary",
  event: "bg-violet-500/10 text-violet-600",
  news: "bg-emerald-500/10 text-emerald-600",
};

const FALLBACK: Announcement[] = [
  {
    id: "fb1",
    title: "Admissions Open 2026-27 — Apply Now!",
    content: "Online and offline admission enquiries are open for all classes. Submit the enquiry form or visit our campus.",
    type: "admission",
    is_pinned: true,
    published_at: new Date().toISOString(),
  },
  {
    id: "fb2",
    title: "Annual Day Celebration on June 15th",
    content: "Join us for cultural performances, awards, and chief guest address. Parents are welcome.",
    type: "event",
    is_pinned: false,
    published_at: new Date().toISOString(),
  },
  {
    id: "fb3",
    title: "Smart Classroom Initiative Launched",
    content: "All senior classes now equipped with interactive panels and digital learning tools.",
    type: "news",
    is_pinned: false,
    published_at: new Date().toISOString(),
  },
];

export default function AnnouncementsPage() {
  const [items, setItems] = useState<Announcement[]>([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cachedFetch(
      "cms/announcements/page",
      () => api.get("/cms/announcements").then((r) => r.data.data || []),
      120_000
    )
      .then((data) => setItems(data.length ? data : FALLBACK))
      .catch(() => setItems(FALLBACK))
      .finally(() => setLoading(false));
  }, []);

  const types = useMemo(
    () => ["All", ...Array.from(new Set(items.map((a) => typeLabels[a.type] || a.type)))],
    [items]
  );

  const filtered = useMemo(() => {
    if (filter === "All") return items;
    return items.filter((a) => (typeLabels[a.type] || a.type) === filter);
  }, [items, filter]);

  const pinned = filtered.filter((a) => a.is_pinned);
  const rest = filtered.filter((a) => !a.is_pinned);

  return (
    <>
      <PageHero
        title="Announcements"
        subtitle="Latest news, admission updates, and school notices"
        backgroundImage={PLACEHOLDER.event}
        breadcrumbs={[{ label: "Announcements" }]}
      />
      <section className="container mx-auto px-4 py-16 lg:px-8">
        <FilterPills options={types} value={filter} onChange={setFilter} layoutId="announcements-filter" className="mb-10" />

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-40 animate-pulse rounded-3xl bg-muted" />
            ))}
          </div>
        ) : (
          <>
            {pinned.length > 0 && (
              <AnimatedSection className="mb-10">
                <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-primary">
                  <Pin className="h-4 w-4" /> Pinned
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {pinned.map((a) => (
                    <AnnouncementCard key={a.id} item={a} featured />
                  ))}
                </div>
              </AnimatedSection>
            )}

            <AnimatedStagger className="grid gap-4 md:grid-cols-2">
              {rest.map((a) => (
                <AnimatedItem key={a.id}>
                  <AnnouncementCard item={a} />
                </AnimatedItem>
              ))}
            </AnimatedStagger>

            {!filtered.length && (
              <GlowCard className="py-16 text-center text-muted-foreground">
                No announcements in this category yet.
              </GlowCard>
            )}
          </>
        )}

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <Link
            href="/admissions"
            className="inline-flex items-center gap-2 rounded-2xl border border-primary/20 bg-primary/5 px-6 py-3 text-sm font-semibold text-primary transition hover:bg-primary/10"
          >
            Interested in admission? Apply now <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </section>
    </>
  );
}

function AnnouncementCard({ item, featured }: { item: Announcement; featured?: boolean }) {
  return (
    <GlowCard className={featured ? "ring-2 ring-primary/20" : ""}>
      <div className="p-6">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${typeStyles[item.type] || typeStyles.general}`}>
            {typeLabels[item.type] || item.type}
          </span>
          {item.is_pinned && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-700">
              <Pin className="h-3 w-3" /> Pinned
            </span>
          )}
          <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            {formatDate(item.published_at)}
          </span>
        </div>
        <div className="flex gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Megaphone className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold">{item.title}</h3>
            {item.content && (
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.content}</p>
            )}
          </div>
        </div>
      </div>
    </GlowCard>
  );
}
