"use client";

import { motion } from "framer-motion";
import { useSettings } from "@/hooks/useSettings";
import { AnimatedCounter } from "@/components/motion/AnimatedCounter";
import { AnimatedStagger, AnimatedItem } from "@/components/motion/AnimatedSection";
import { STATS } from "@/lib/constants";

export function StatsSection() {
  const { settings } = useSettings();
  const dbStats = settings.stats || {};
  const items = [
    { label: "Students", value: dbStats.students || STATS[0].value },
    { label: "Expert Teachers", value: dbStats.teachers || STATS[1].value },
    { label: "Years of Excellence", value: dbStats.years || STATS[2].value },
    { label: "Awards Won", value: dbStats.awards || STATS[3].value },
  ];

  return (
    <section className="container relative z-10 mx-auto -mt-20 px-4 lg:px-8">
      <AnimatedStagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((stat) => (
          <AnimatedItem key={stat.label}>
            <motion.div
              whileHover={{ y: -4, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="glass-card group relative overflow-hidden rounded-3xl p-6 text-center"
            >
              <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-primary/10 blur-2xl transition-all duration-500 group-hover:bg-primary/20" />
              <p className="text-3xl font-extrabold gradient-text md:text-4xl">
                <AnimatedCounter value={String(stat.value)} />
              </p>
              <p className="mt-2 text-sm font-medium text-muted-foreground">{stat.label}</p>
            </motion.div>
          </AnimatedItem>
        ))}
      </AnimatedStagger>
    </section>
  );
}
