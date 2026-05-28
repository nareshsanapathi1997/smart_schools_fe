"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { cachedFetch } from "@/lib/request-cache";
import { LookupItem, LookupType, lookupOptions } from "@/lib/lookups";

const adminCache: Record<string, LookupItem[]> = {};

export function useLookups(type: LookupType, opts?: { all?: boolean; enabled?: boolean }) {
  const [items, setItems] = useState<LookupItem[]>([]);
  const [loading, setLoading] = useState(true);
  const enabled = opts?.enabled !== false;
  const all = opts?.all === true;

  useEffect(() => {
    if (!enabled) return;

    const cacheKey = `lookups:${type}:${all ? "all" : "active"}`;

    if (all && adminCache[cacheKey]) {
      setItems(adminCache[cacheKey]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const fetcher = () =>
      api
        .get("/lookups", { params: { type, ...(all ? { all: "true" } : {}) } })
        .then((res) => (res.data.data || []) as LookupItem[]);

    const promise = all
      ? fetcher().then((data) => {
          adminCache[cacheKey] = data;
          return data;
        })
      : cachedFetch(cacheKey, fetcher, 300_000);

    promise
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [type, all, enabled]);

  return {
    items,
    options: lookupOptions(items, type, !all),
    loading,
  };
}

export function clearLookupCache(type?: LookupType) {
  if (type) {
    delete adminCache[`lookups:${type}:all`];
    delete adminCache[`lookups:${type}:active`];
  } else {
    Object.keys(adminCache).forEach((key) => delete adminCache[key]);
  }
}
