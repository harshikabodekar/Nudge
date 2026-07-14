import { NextRequest, NextResponse } from "next/server";
import { searchSymbols } from "@/lib/yahooFinance";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q");

  if (!q || !q.trim()) {
    return NextResponse.json({ results: [] });
  }

  const CDN_CACHE = "s-maxage=3600, stale-while-revalidate=86400";

  try {
    const results = await searchSymbols(q);
    return NextResponse.json({ results }, { headers: { "Cache-Control": CDN_CACHE } });
  } catch {
    return NextResponse.json({ results: [], error: "search_failed" });
  }
}
