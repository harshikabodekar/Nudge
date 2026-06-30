import { NextRequest, NextResponse } from "next/server";
import { getStockData } from "@/lib/yahooFinance";

const SYMBOL_PATTERN = /^[A-Z0-9.]{1,15}$/i;

export async function GET(request: NextRequest) {
  const symbol = request.nextUrl.searchParams.get("symbol");

  if (!symbol || !SYMBOL_PATTERN.test(symbol)) {
    return NextResponse.json({ data: null, error: "invalid_symbol" }, { status: 400 });
  }

  try {
    const data = await getStockData(symbol);
    if (!data) {
      return NextResponse.json({ data: null, error: "unavailable" });
    }
    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ data: null, error: "fetch_failed" });
  }
}
