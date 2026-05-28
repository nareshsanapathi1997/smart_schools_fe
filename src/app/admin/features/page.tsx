"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlowCard } from "@/components/motion/AnimatedSection";
import {
  ADMIN_FEATURES,
  FEATURE_STATUS_LABELS,
  FEATURE_STATUS_STYLES,
  FeatureStatus,
} from "@/lib/admin-features";
import { cn } from "@/lib/utils";

const categories = ["All", ...Array.from(new Set(ADMIN_FEATURES.map((f) => f.category)))] as const;

export default function AdminFeaturesPage() {
  const [filter, setFilter] = useState<(typeof categories)[number]>("All");
  const [statusFilter, setStatusFilter] = useState<FeatureStatus | "all">("all");

  const filtered = useMemo(() => {
    return ADMIN_FEATURES.filter((feature) => {
      if (filter !== "All" && feature.category !== filter) return false;
      if (statusFilter !== "all" && feature.status !== statusFilter) return false;
      return true;
    });
  }, [filter, statusFilter]);

  const counts = useMemo(() => ({
    live: ADMIN_FEATURES.filter((f) => f.status === "live").length,
    coming_soon: ADMIN_FEATURES.filter((f) => f.status === "coming_soon").length,
    planned: ADMIN_FEATURES.filter((f) => f.status === "planned").length,
    partial: ADMIN_FEATURES.filter((f) => f.status === "partial").length,
  }), []);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
            <LayoutGrid className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Features & Modules</h1>
            <p className="text-muted-foreground">What is available now and what can be added next</p>
          </div>
        </div>
        <Link href="/admin/students">
          <Button className="rounded-xl"><Sparkles className="h-4 w-4" /> New: Student Records</Button>
        </Link>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {(["live", "partial", "coming_soon", "planned"] as FeatureStatus[]).map((status) => (
          <GlowCard key={status} className="p-5">
            <p className="text-sm text-muted-foreground">{FEATURE_STATUS_LABELS[status]}</p>
            <p className="mt-1 text-3xl font-bold">{counts[status]}</p>
          </GlowCard>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setFilter(cat)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition",
              filter === cat ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:bg-primary/10"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {(["all", "live", "partial", "coming_soon", "planned"] as const).map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => setStatusFilter(status)}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-medium transition",
              statusFilter === status ? "bg-violet-600 text-white" : "bg-muted text-muted-foreground"
            )}
          >
            {status === "all" ? "All Statuses" : FEATURE_STATUS_LABELS[status]}
          </button>
        ))}
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((feature, i) => (
          <motion.div key={feature.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
            <GlowCard className="flex h-full flex-col p-5">
              <div className="mb-3 flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{feature.category}</p>
                  <h3 className="mt-1 text-lg font-bold">{feature.title}</h3>
                </div>
                <span className={cn("shrink-0 rounded-full px-2.5 py-1 text-xs font-medium", FEATURE_STATUS_STYLES[feature.status])}>
                  {FEATURE_STATUS_LABELS[feature.status]}
                </span>
              </div>
              <p className="flex-1 text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
              {feature.href && (feature.status === "live" || feature.status === "partial") ? (
                <Link href={feature.href} className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
                  Open module <ArrowRight className="h-4 w-4" />
                </Link>
              ) : (
                <p className="mt-4 text-xs text-muted-foreground">Contact your developer to enable this module.</p>
              )}
            </GlowCard>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
