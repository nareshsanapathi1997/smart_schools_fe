"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Megaphone, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import api from "@/lib/api";
import { cachedFetch } from "@/lib/request-cache";

interface Announcement {
  id: string;
  title: string;
}

const fallback = [
  { id: "1", title: "Admissions Open 2026-27 — Apply Now!" },
  { id: "2", title: "Annual Day Celebration on June 15th" },
  { id: "3", title: "Smart Classroom Initiative Launched" },
];

export function AnnouncementTicker() {
  const pathname = usePathname();
  const [items, setItems] = useState<Announcement[]>([]);

  useEffect(() => {
    if (pathname.startsWith("/admin") || pathname.startsWith("/portal")) return;
    cachedFetch(
      "cms/announcements",
      () => api.get("/cms/announcements").then((res) => res.data.data || []),
      120_000
    )
      .then(setItems)
      .catch(() => {});
  }, [pathname]);

  if (pathname.startsWith("/admin") || pathname.startsWith("/portal")) return null;

  const list = items.length ? items : fallback;

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-primary via-violet-600 to-accent text-white">
      <div className="absolute inset-0 animate-gradient bg-[length:200%_200%] bg-gradient-to-r from-primary via-violet-500 to-fuchsia-600 opacity-80" />
      <div className="container relative mx-auto flex items-center gap-3 px-4 py-2.5">
        <motion.span
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="flex shrink-0 items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-semibold backdrop-blur-sm"
        >
          <Megaphone className="h-3.5 w-3.5" /> LIVE
        </motion.span>
        <div className="relative flex-1 overflow-hidden">
          <div className="animate-marquee whitespace-nowrap text-sm font-medium">
            {list.map((a) => (
              <span key={a.id} className="mx-10 inline-block">{a.title}</span>
            ))}
            {list.map((a) => (
              <span key={`${a.id}-dup`} className="mx-10 inline-block">{a.title}</span>
            ))}
          </div>
        </div>
        <Link
          href="/announcements"
          className="flex shrink-0 items-center gap-0.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur-sm transition hover:bg-white/25"
        >
          View all <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
