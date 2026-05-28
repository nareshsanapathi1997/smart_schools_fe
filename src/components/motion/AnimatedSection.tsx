"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { cn } from "@/lib/utils";
import { fadeUp } from "@/lib/motion";

interface AnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  once?: boolean;
}

export function AnimatedSection({ children, className, delay = 0, once = true }: AnimatedSectionProps) {
  const ref = useRef(null);
  const inView = useInView(ref, { once, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={{
        hidden: fadeUp.hidden,
        visible: {
          ...fadeUp.visible,
          transition: { ...fadeUp.visible.transition, delay },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface AnimatedStaggerProps {
  children: React.ReactNode;
  className?: string;
  once?: boolean;
}

export function AnimatedStagger({ children, className, once = true, resetKey }: AnimatedStaggerProps & { resetKey?: string | number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once, margin: "-40px" });

  return (
    <motion.div
      key={resetKey}
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.08, delayChildren: 0.04 } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function AnimatedItem({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div variants={fadeUp} className={className}>
      {children}
    </motion.div>
  );
}

interface GlowCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function GlowCard({ children, className, onClick }: GlowCardProps) {
  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 320, damping: 22 }}
      onClick={onClick}
      className={cn(
        "group relative overflow-hidden rounded-3xl border border-border/50 bg-card shadow-soft",
        "before:pointer-events-none before:absolute before:inset-0 before:z-0 before:bg-gradient-to-br before:from-primary/0 before:to-accent/0 before:opacity-0 before:transition-opacity before:duration-500 hover:before:from-primary/5 hover:before:to-accent/5 hover:before:opacity-100",
        "[&>*]:relative [&>*]:z-[1]",
        "hover:border-primary/20 hover:shadow-premium",
        className
      )}
    >
      {children}
    </motion.div>
  );
}
