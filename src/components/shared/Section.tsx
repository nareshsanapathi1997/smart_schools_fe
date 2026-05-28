import { cn } from "@/lib/utils";

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "muted" | "gradient" | "dark";
  id?: string;
}

export function Section({ children, className, variant = "default", id }: SectionProps) {
  return (
    <section
      id={id}
      className={cn(
        "relative py-20 lg:py-24",
        variant === "default" && "bg-background",
        variant === "muted" && "bg-muted/40 section-muted",
        variant === "gradient" && "section-gradient",
        variant === "dark" && "bg-slate-950 text-white",
        className
      )}
    >
      {variant === "gradient" && (
        <>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
          <div className="pointer-events-none absolute right-0 top-0 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
        </>
      )}
      <div className="container relative mx-auto px-4 lg:px-8">{children}</div>
    </section>
  );
}

interface SectionHeaderProps {
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: string;
  centered?: boolean;
  className?: string;
}

export function SectionHeader({ eyebrow, title, subtitle, centered = true, className }: SectionHeaderProps) {
  return (
    <div className={cn("mb-14", centered && "text-center", className)}>
      {eyebrow && (
        <span className="mb-3 inline-block text-sm font-semibold uppercase tracking-widest text-primary">
          {eyebrow}
        </span>
      )}
      <h2 className={cn("text-3xl font-bold md:text-4xl lg:text-5xl", centered && "mx-auto max-w-3xl")}>
        {title}
      </h2>
      {subtitle && (
        <p className={cn("mt-4 text-muted-foreground md:text-lg", centered && "mx-auto max-w-2xl")}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
