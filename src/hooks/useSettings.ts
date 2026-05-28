"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { cachedFetch } from "@/lib/request-cache";

export type SiteSettings = {
  school_info?: { name?: string; tagline?: string; phone?: string; email?: string; address?: string; whatsapp?: string; brochure_url?: string };
  stats?: Record<string, string>;
  social?: Record<string, string>;
  seo?: { title?: string; description?: string; keywords?: string };
  about_page?: Record<string, unknown>;
  home_page?: { hero_title?: string; hero_subtitle?: string; video_url?: string; video_thumbnail?: string };
};

let cache: SiteSettings | null = null;

export function useSettings() {
  const [settings, setSettings] = useState<SiteSettings>(cache || {});
  const [loading, setLoading] = useState(!cache);

  useEffect(() => {
    if (cache) return;
    cachedFetch(
      "cms/settings",
      () => api.get("/cms/settings").then((res) => (res.data.data || {}) as SiteSettings),
      300_000
    )
      .then((data) => {
        cache = data;
        setSettings(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return { settings, loading };
}

export function clearSettingsCache() {
  cache = null;
}
