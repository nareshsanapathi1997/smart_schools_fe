import { cn } from "@/lib/utils";

interface PageSkeletonProps {
  title?: boolean;
  cards?: number;
  rows?: number;
  className?: string;
}

export function PageSkeleton({ title = true, cards = 4, rows = 6, className }: PageSkeletonProps) {
  return (
    <div className={cn("animate-pulse space-y-8", className)}>
      {title && (
        <div className="space-y-2">
          <div className="h-9 w-48 rounded-xl bg-muted" />
          <div className="h-4 w-72 max-w-full rounded-lg bg-muted/80" />
        </div>
      )}
      {cards > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: cards }).map((_, i) => (
            <div key={i} className="h-28 rounded-2xl border border-border/40 bg-muted/60" />
          ))}
        </div>
      )}
      {rows > 0 && (
        <div className="space-y-3 rounded-2xl border border-border/40 bg-card/50 p-6">
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="h-12 rounded-xl bg-muted/60" />
          ))}
        </div>
      )}
    </div>
  );
}
