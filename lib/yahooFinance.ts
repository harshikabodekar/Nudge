// 24h keeps repeated views of the same 3 companies cheap and is polite to
// Yahoo's unofficial endpoint (no API key / quota to manage here, but no
// reason to refetch on every page view either).
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

const YAHOO_CHART_URL = "https://query1.finance.yahoo.com/v8/finance/chart";
const YAHOO_SEARCH_URL = "https://query2.finance.yahoo.com/v1/finance/search";

// Yahoo's edge/CDN blocks requests with no User-Agent (confirmed: returns
// "429 Too Many Requests" instantly, even on the very first request) — a
// browser-like one is required to get a real response.
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";

export interface LiveStockData {
  symbol: string;
  price: number;
  changePercent: number | null;
  peRatio: number | null;
  marketCap: number | null;
  week52High: number | null;
  week52Low: number | null;
  sector: string | null;
  description: string | null;
  name: string | null;
}

interface CacheEntry {
  data: LiveStockData | null;
  expiresAt: number;
}

// Module-level cache: lives for as long as this server process/instance does.
const cache = new Map<string, CacheEntry>();

interface YahooChartMeta {
  regularMarketPrice?: number;
  previousClose?: number;
  chartPreviousClose?: number;
  fiftyTwoWeekHigh?: number;
  fiftyTwoWeekLow?: number;
  longName?: string;
  shortName?: string;
}

interface YahooChartResponse {
  chart?: {
    result?: Array<{ meta?: YahooChartMeta }> | null;
  };
}

async function fetchYahooChart(symbol: string): Promise<YahooChartResponse> {
  const url = `${YAHOO_CHART_URL}/${encodeURIComponent(symbol)}`;
  const res = await fetch(url, {
    headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
  });
  if (!res.ok) {
    throw new Error(`Yahoo Finance request failed with status ${res.status}`);
  }
  return res.json();
}

/**
 * Fetches + shapes live data for one symbol, backed by an in-memory cache.
 * Returns null whenever Yahoo has no usable price (blocked, delisted symbol,
 * network error, etc.) so callers can fall back gracefully instead of
 * crashing. Failed lookups are cached too, so a bad/blocked symbol isn't
 * re-requested on every view.
 *
 * Yahoo Finance has no official public API. The unauthenticated "chart"
 * endpoint reliably returns price, previous close, and 52-week high/low.
 * Fundamentals (PE ratio, market cap, sector) live behind the
 * quoteSummary/quote endpoints, which Yahoo gates behind a crumb token —
 * confirmed live: every fundamentals request returns 401 "Invalid Crumb",
 * and the cookie handshake needed to obtain one is unreliable from a server
 * context. Those fields are left null here so callers fall back to the
 * static reference figures, exactly as the graceful-degradation design
 * already does for any other missing field.
 */
export async function getStockData(symbol: string): Promise<LiveStockData | null> {
  const cached = cache.get(symbol);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  let json: YahooChartResponse | null;
  try {
    json = await fetchYahooChart(symbol);
  } catch {
    json = null;
  }

  const meta = json?.chart?.result?.[0]?.meta;
  const price = typeof meta?.regularMarketPrice === "number" ? meta.regularMarketPrice : null;

  if (!meta || price === null) {
    cache.set(symbol, { data: null, expiresAt: Date.now() + CACHE_TTL_MS });
    return null;
  }

  const previousClose =
    typeof meta.previousClose === "number"
      ? meta.previousClose
      : typeof meta.chartPreviousClose === "number"
        ? meta.chartPreviousClose
        : null;
  const changePercent = previousClose ? ((price - previousClose) / previousClose) * 100 : null;

  const data: LiveStockData = {
    symbol,
    price,
    changePercent,
    peRatio: null,
    marketCap: null,
    week52High: typeof meta.fiftyTwoWeekHigh === "number" ? meta.fiftyTwoWeekHigh : null,
    week52Low: typeof meta.fiftyTwoWeekLow === "number" ? meta.fiftyTwoWeekLow : null,
    sector: null,
    description: null,
    name: meta.longName ?? meta.shortName ?? null,
  };

  cache.set(symbol, { data, expiresAt: Date.now() + CACHE_TTL_MS });
  return data;
}

export interface SymbolSearchResult {
  symbol: string;
  name: string;
  exchange: string;
  sector: string | null;
  industry: string | null;
}

interface YahooSearchQuote {
  symbol?: string;
  shortname?: string;
  longname?: string;
  quoteType?: string;
  exchDisp?: string;
  sector?: string;
  industry?: string;
}

interface YahooSearchResponse {
  quotes?: YahooSearchQuote[] | null;
}

async function fetchYahooSearch(query: string): Promise<YahooSearchResponse> {
  const url = `${YAHOO_SEARCH_URL}?q=${encodeURIComponent(query)}&quotesCount=10&newsCount=0`;
  const res = await fetch(url, {
    headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
  });
  if (!res.ok) {
    throw new Error(`Yahoo Finance search failed with status ${res.status}`);
  }
  return res.json();
}

// Yahoo only indexes companies by their CURRENT legal name, so a company
// that renamed/demerged (see lib/nudge-data.ts) is unsearchable by the name
// most people still know it by. Maps that commonly-known name to the term
// that actually finds it. Lowercase, exact match on the full query — add
// more entries here as they come up.
const SEARCH_ALIASES: Record<string, string> = {
  zomato: "eternal",
};

/**
 * Looks up companies by free-text query via Yahoo's unofficial autocomplete
 * endpoint, filtered to NSE (.NS) and BSE (.BO) equities so results stay
 * India-focused. Returns an empty array on any failure (blocked, network
 * error, no matches) rather than throwing — callers should treat "no
 * results" and "search is down" the same way: show a clean empty state.
 */
export interface PricePoint {
  timestamp: number;
  close: number;
}

const historyCache = new Map<string, { data: PricePoint[]; expiresAt: number }>();

/**
 * Fetches ~12 monthly closing prices for the past year for a given symbol.
 * Returns an empty array on failure — callers should treat no history and
 * fetch error the same way (omit the sparkline).
 */
export async function getStockHistory(symbol: string): Promise<PricePoint[]> {
  const cached = historyCache.get(symbol);
  if (cached && cached.expiresAt > Date.now()) return cached.data;

  try {
    const url = `${YAHOO_CHART_URL}/${encodeURIComponent(symbol)}?range=1y&interval=1mo`;
    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
    });
    if (!res.ok) throw new Error(`status ${res.status}`);

    const json = await res.json() as {
      chart?: {
        result?: Array<{
          timestamp?: number[];
          indicators?: { quote?: Array<{ close?: (number | null)[] }> };
        }> | null;
      };
    };

    const result = json?.chart?.result?.[0];
    const timestamps = result?.timestamp ?? [];
    const closes = result?.indicators?.quote?.[0]?.close ?? [];

    const points: PricePoint[] = [];
    for (let i = 0; i < timestamps.length; i++) {
      const close = closes[i];
      if (typeof close === "number" && Number.isFinite(close)) {
        points.push({ timestamp: timestamps[i], close });
      }
    }

    historyCache.set(symbol, { data: points, expiresAt: Date.now() + CACHE_TTL_MS });
    return points;
  } catch {
    historyCache.set(symbol, { data: [], expiresAt: Date.now() + 60 * 60 * 1000 });
    return [];
  }
}

export async function searchSymbols(query: string): Promise<SymbolSearchResult[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const effectiveQuery = SEARCH_ALIASES[trimmed.toLowerCase()] ?? trimmed;

  let json: YahooSearchResponse;
  try {
    json = await fetchYahooSearch(effectiveQuery);
  } catch {
    return [];
  }

  const quotes = json.quotes ?? [];
  const results: SymbolSearchResult[] = [];
  for (const quote of quotes) {
    if (
      quote.quoteType !== "EQUITY" ||
      typeof quote.symbol !== "string" ||
      !(quote.symbol.endsWith(".NS") || quote.symbol.endsWith(".BO"))
    ) {
      continue;
    }
    results.push({
      symbol: quote.symbol,
      name: quote.longname || quote.shortname || quote.symbol,
      exchange: quote.exchDisp ?? (quote.symbol.endsWith(".NS") ? "NSE" : "BSE"),
      sector: quote.sector ?? null,
      industry: quote.industry ?? null,
    });
  }
  return results.slice(0, 8);
}
