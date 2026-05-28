"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

const CACHE_TTL_MS = 5 * 60 * 1000;

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
  promise?: Promise<T>;
}

const cache = new Map<string, CacheEntry<unknown>>();

function cacheKey(url: string, params?: Record<string, unknown>) {
  return `${url}?${JSON.stringify(params ?? {})}`;
}

function getValidEntry<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry || Date.now() >= entry.expiresAt) return null;
  return entry.data as T;
}

async function loadCached<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
  const cached = getValidEntry<T>(key);
  if (cached !== null) return cached;

  const existing = cache.get(key);
  if (existing?.promise) return existing.promise as Promise<T>;

  const promise = fetcher()
    .then((data) => {
      cache.set(key, { data, expiresAt: Date.now() + CACHE_TTL_MS });
      return data;
    })
    .catch((err) => {
      cache.delete(key);
      throw err;
    });

  cache.set(key, { data: existing?.data, expiresAt: 0, promise } as CacheEntry<unknown>);
  return promise;
}

export function invalidateCachedResource(url: string, params?: Record<string, unknown>) {
  cache.delete(cacheKey(url, params));
}

export function useCachedResource<T>(
  url: string,
  params?: Record<string, unknown>,
  options?: { enabled?: boolean }
) {
  const enabled = options?.enabled !== false;
  const paramsKey = JSON.stringify(params ?? {});
  const key = cacheKey(url, params);

  const [data, setData] = useState<T | null>(() => (enabled ? getValidEntry<T>(key) : null));
  const [loading, setLoading] = useState(() => enabled && getValidEntry<T>(key) === null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!enabled) {
      setData(null);
      setLoading(false);
      return;
    }

    const cached = getValidEntry<T>(key);
    if (cached !== null) {
      setData(cached);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    loadCached<T>(key, () =>
      api.get(url, { params }).then((res) => (res.data.data ?? res.data) as T)
    )
      .then((result) => {
        if (!cancelled) {
          setData(result);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error(String(err)));
          setData(null);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [key, enabled, url, paramsKey]);

  return { data, loading, error };
}
