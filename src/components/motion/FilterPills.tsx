"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface FilterPillsProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  layoutId?: string;
}

export function FilterPills({ options, value, onChange, className, layoutId = "filter-pill" }: FilterPillsProps) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {options.map((option) => {
        const active = value === option;
        return (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={cn(
              "relative rounded-full px-5 py-2.5 text-sm font-medium transition-colors",
              active ? "text-white" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {active && (
              <motion.span
                layoutId={layoutId}
                className="absolute inset-0 rounded-full bg-gradient-to-r from-primary to-violet-600 shadow-glow"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <span className="relative z-10">{option}</span>
          </button>
        );
      })}
    </div>
  );
}
