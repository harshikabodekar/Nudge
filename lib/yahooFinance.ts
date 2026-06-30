// 24h keeps repeated views of the same 3 companies cheap and is polite to
// Yahoo's unofficial endpoint (no API key / quota to manage here, but no
// reason to refetch on every page view either).
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

const YAHOO_CHART_URL = "https://query1.finance.yahoo.com/v8/finance/chart";

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
