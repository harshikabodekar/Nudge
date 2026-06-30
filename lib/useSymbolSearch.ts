"use client";

import { useEffect, useState } from "react";
import type { SymbolSearchResult } from "@/lib/yahooFinance";

export type SymbolSearchStatus = "idle" | "loading" | "ready" | "error";

export interface SymbolSearchState {
  results: SymbolSearchResult[];
  status: SymbolSearchStatus;
}

const DEBOUNCE_MS = 350;
const MIN_QUERY_LENGTH = 2;

// Module-level cache keyed by trimmed query text. `null` means "asked and
// failed" so a flaky query isn't re-requested on every keystroke that lands
// back on it (e.g. typing then backspacing).
const cache = new Map<string, SymbolSearchResult[] | null>();
const pending = new Set<string>();

function stateFor(query: string): SymbolSearchState {
  if (query.length < MIN_QUERY_LENGTH) {
    return { results: [], status: "idle" };
  }
  if (!cache.has(query)) {
    return { results: [], status: "loading" };
  }
  const cached = cache.get(query) ?? null;
  return { results: cached ?? [], status: cached === null ? "error" : "ready" };
}

export function useSymbolSearch(rawQuery: string): SymbolSearchState {
  const query = rawQuery.trim();
  // Bumped after a debounced fetch resolves to force re-reading the cache.
  const [, forceRender] = useState(0);

  useEffect(() => {
    if (query.length < MIN_QUERY_LENGTH) return;
    if (cache.has(query)) return;

    let cancelled = false;
    const timer = setTimeout(() => {
      if (pending.has(query)) return;
      pending.add(query);

      fetch(`/api/search?q=${encodeURIComponent(query)}`)
        .then((res) => res.json())
        .then((json: { results: SymbolSearchResult[] }) => {
          cache.set(query, json.results ?? []);
        })
        .catch(() => {
          cache.set(query, null);
        })
        .finally(() => {
          pending.delete(query);
          if (!cancelled) forceRender((n) => n + 1);
        });
    }, DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

  return stateFor(query);
}
