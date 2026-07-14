import { NextRequest, NextResponse } from "next/server";
import { getStockData } from "@/lib/yahooFinance";

const SYMBOL_PATTERN = /^[A-Z0-9.]{1,15}$/i;

export async function GET(request: NextRequest) {
  const symbol = request.nextUrl.searchParams.get("symbol");

  if (!symbol || !SYMBOL_PATTERN.test(symbol)) {
    return NextResponse.json({ data: null, error: "invalid_symbol" }, { status: 400 });
  }

  const CDN_CACHE = "s-maxage=3600, stale-while-revalidate=86400";

  try {
    const data = await getStockData(symbol);
    if (!data) {
      return NextResponse.json(
        { data: null, error: "unavailable" },
        { headers: { "Cache-Control": CDN_CACHE } }
      );
    }
    return NextResponse.json({ data }, { headers: { "Cache-Control": CDN_CACHE } });
  } catch {
    return NextResponse.json({ data: null, error: "fetch_failed" });
  }
}
