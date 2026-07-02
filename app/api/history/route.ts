import { NextRequest, NextResponse } from "next/server";
import { getStockHistory } from "@/lib/yahooFinance";

const SYMBOL_PATTERN = /^[A-Z0-9.]{1,15}$/i;

export async function GET(request: NextRequest) {
  const symbol = request.nextUrl.searchParams.get("symbol");

  if (!symbol || !SYMBOL_PATTERN.test(symbol)) {
    return NextResponse.json({ history: [], error: "invalid_symbol" }, { status: 400 });
  }

  try {
    const history = await getStockHistory(symbol);
    return NextResponse.json({ history });
  } catch {
    return NextResponse.json({ history: [], error: "fetch_failed" });
  }
}
