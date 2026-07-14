import { NextRequest, NextResponse } from "next/server";
import { getStockHistory, getStockHistoryOHLC } from "@/lib/yahooFinance";

const SYMBOL_PATTERN = /^[A-Z0-9.]{1,15}$/i;
const VALID_RANGES = new Set(["1mo", "6mo", "1y"]);
const VALID_INTERVALS = new Set(["1d", "1wk", "1mo"]);

const CDN_CACHE = "s-maxage=3600, stale-while-revalidate=86400";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const symbol = params.get("symbol");

  if (!symbol || !SYMBOL_PATTERN.test(symbol)) {
    return NextResponse.json({ history: [], error: "invalid_symbol" }, { status: 400 });
  }

  const range = params.get("range");
  const interval = params.get("interval");

  // If range + interval provided, return OHLC data for the full chart
  if (range !== null || interval !== null) {
    if (!range || !VALID_RANGES.has(range)) {
      return NextResponse.json({ history: [], error: "invalid_range" }, { status: 400 });
    }
    if (!interval || !VALID_INTERVALS.has(interval)) {
      return NextResponse.json({ history: [], error: "invalid_interval" }, { status: 400 });
    }
    try {
      const history = await getStockHistoryOHLC(symbol, range, interval);
      return NextResponse.json({ history }, { headers: { "Cache-Control": CDN_CACHE } });
    } catch {
      return NextResponse.json({ history: [], error: "fetch_failed" });
    }
  }

  // Legacy: no range/interval — return simple close-only history
  try {
    const history = await getStockHistory(symbol);
    return NextResponse.json({ history }, { headers: { "Cache-Control": CDN_CACHE } });
  } catch {
    return NextResponse.json({ history: [], error: "fetch_failed" });
  }
}
