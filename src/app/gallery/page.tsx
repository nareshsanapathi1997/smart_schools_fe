"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PageHero } from "@/components/shared/PageHero";
import { SafeImage } from "@/components/shared/SafeImage";
import { VideoBlock } from "@/components/shared/VideoBlock";
import { FilterPills } from "@/components/motion/FilterPills";
import { AnimatedStagger, AnimatedItem, GlowCard } from "@/components/motion/AnimatedSection";
import { PLACEHOLDER, galleryFallback, resolveMediaUrl } from "@/lib/images";
import { X, ZoomIn } from "lucide-react";
import api from "@/lib/api";
import { cachedFetch } from "@/lib/request-cache";

interface GalleryItem {
  id: string;
  title: string;
  media_url: string;
  media_type: string;
  category: string;
}

export default function GalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [filter, setFilter] = useState("All");
  const [lightbox, setLightbox] = useState<GalleryItem | null>(null);

  useEffect(() => {
    cachedFetch(
      "gallery/all",
      () => api.get("/gallery").then((r) => r.data.data || []),
      300_000
    )
      .then(setItems)
      .catch(() => {});
  }, []);

  const categories = ["All", ...Array.from(new Set(items.map((i) => i.category)))];
  const filtered = filter === "All" ? items : items.filter((i) => i.category === filter);

  return (
    <>
      <PageHero
        title="Gallery"
        subtitle="Photos and videos from campus life"
        backgroundImage={PLACEHOLDER.gallery}
        breadcrumbs={[{ label: "Gallery" }]}
      />
      <section className="container mx-auto px-4 py-16 lg:px-8">
        <FilterPills options={categories} value={filter} onChange={setFilter} className="mb-10" />

        <AnimatedStagger className="columns-1 gap-4 sm:columns-2 lg:columns-3">
          {filtered.map((item, i) => (
            <AnimatedItem key={item.id} className="mb-4 break-inside-avoid">
              <GlowCard
                className="group cursor-pointer"
                onClick={() => item.media_type !== "video" && setLightbox(item)}
              >
                {item.media_type === "video" ? (
                  <div className="relative aspect-video">
                    <VideoBlock url={item.media_url} thumbnail={PLACEHOLDER.videoThumb} title={item.title} />
                  </div>
                ) : (
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <SafeImage src={item.media_url} alt={item.title} fallback={galleryFallback(i)} fill className="transition duration-700 group-hover:scale-110" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                      <ZoomIn className="h-8 w-8 text-white" />
                    </div>
                  </div>
                )}
                <p className="p-4 text-sm font-medium">{item.title}</p>
              </GlowCard>
            </AnimatedItem>
          ))}
        </AnimatedStagger>
      </section>

      <AnimatePresence>
        {lightbox && lightbox.media_type !== "video" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
            onClick={() => setLightbox(null)}
          >
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute right-6 top-6 rounded-full bg-white/10 p-2 text-white backdrop-blur-md"
              onClick={() => setLightbox(null)}
            >
              <X className="h-6 w-6" />
            </motion.button>
            <motion.img
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              src={resolveMediaUrl(lightbox.media_url, PLACEHOLDER.gallery)}
              alt={lightbox.title}
              className="max-h-[90vh] max-w-full rounded-2xl object-contain shadow-premium"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
