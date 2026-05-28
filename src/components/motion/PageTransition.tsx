"use client";

import { motion } from "framer-motion";
import { pageTransition } from "@/lib/motion";

export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div initial="initial" animate="animate" exit="exit" variants={pageTransition}>
      {children}
    </motion.div>
  );
}

export function ScrollProgressBar() {
  return (
    <motion.div
      className="fixed left-0 top-0 z-[60] h-1 origin-left bg-gradient-to-r from-primary via-violet-500 to-accent"
      style={{ scaleX: 0 }}
      aria-hidden
    />
  );
}
