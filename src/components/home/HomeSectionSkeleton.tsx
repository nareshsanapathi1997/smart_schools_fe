"use client";

import { cn } from "@/lib/utils";

export function HomeSectionSkeleton({ count = 4, className }: { count?: number; className?: string }) {
  return (
    <div className={cn("grid gap-6 sm:grid-cols-2 lg:grid-cols-4", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-3xl border border-border/40 bg-card animate-pulse">
          <div className="aspect-[4/3] bg-muted" />
          <div className="space-y-3 p-5">
            <div className="h-4 w-3/4 rounded-lg bg-muted" />
            <div className="h-3 w-full rounded bg-muted/80" />
            <div className="h-3 w-2/3 rounded bg-muted/80" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function TestimonialSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-3xl border border-border/40 bg-card p-6 animate-pulse">
          <div className="mb-5 flex gap-3">
            <div className="h-14 w-14 rounded-2xl bg-muted" />
            <div className="space-y-2">
              <div className="h-4 w-24 rounded bg-muted" />
              <div className="h-3 w-16 rounded bg-muted/80" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-3 w-full rounded bg-muted/80" />
            <div className="h-3 w-full rounded bg-muted/80" />
            <div className="h-3 w-2/3 rounded bg-muted/80" />
          </div>
        </div>
      ))}
    </div>
  );
}
