"use client";

import { useEffect, useState } from "react";
import type { LiveStockData } from "@/lib/yahooFinance";

export type LiveStockStatus = "loading" | "ready" | "unavailable";

export interface LiveStockState {
  data: LiveStockData | null;
  status: LiveStockStatus;
}

// In-memory, per-tab cache: avoids re-fetching our own /api/stock route when
// the user flips back and forth between companies within one session.
// `null` means "we already asked and it came back unavailable" (also cached,
// so a flaky/rate-limited symbol doesn't get hammered on every click).
const sessionCache = new Map<string, LiveStockData | null>();
const inFlight = new Map<string, Promise<void>>();

function stateFor(symbol: string): LiveStockState {
  if (!sessionCache.has(symbol)) {
    return { data: null, status: "loading" };
  }
  const cached = sessionCache.get(symbol) ?? null;
  return { data: cached, status: cached ? "ready" : "unavailable" };
}

function fetchAndCache(symbol: string): Promise<void> {
  const existing = inFlight.get(symbol);
  if (existing) return existing;

  const promise = fetch(`/api/stock?symbol=${encodeURIComponent(symbol)}`)
    .then((res) => res.json())
    .then((json: { data: LiveStockData | null }) => {
      sessionCache.set(symbol, json.data ?? null);
    })
    .catch(() => {
      sessionCache.set(symbol, null);
    })
    .finally(() => {
      inFlight.delete(symbol);
    });

  inFlight.set(symbol, promise);
  return promise;
}

export function useLiveStock(symbol: string): LiveStockState {
  // Bumped after a fetch resolves to force re-reading the cache below.
  const [, forceRender] = useState(0);

  useEffect(() => {
    if (sessionCache.has(symbol)) return;

    let cancelled = false;
    fetchAndCache(symbol).then(() => {
      if (!cancelled) forceRender((n) => n + 1);
    });

    return () => {
      cancelled = true;
    };
  }, [symbol]);

  return stateFor(symbol);
}
