"use client";

import { useEffect } from "react";
import { companies, fmt, vibeColors } from "@/lib/nudge-data";
import { useLiveStock } from "@/lib/useLiveStock";
import type { Holding } from "@/lib/wallet";

export default function HoldingRow({
  holding,
  onTrade,
  onPriceResolved,
}: {
  holding: Holding;
  onTrade: (symbol: string, name: string) => void;
  onPriceResolved: (symbol: string, price: number) => void;
}) {
  const live = useLiveStock(holding.symbol);
  // Live price where available, else the holding's own avg cost (flat P/L)
  // — never a stale static reference price.
  const currentPrice = live.data?.price ?? holding.avgPrice;

  // Report the resolved price up so the wallet summary above can include
  // this holding in its live-aggregated total/P&L.
  useEffect(() => {
    onPriceResolved(holding.symbol, currentPrice);
  }, [holding.symbol, currentPrice, onPriceResolved]);

  const value = holding.quantity * currentPrice;
  const pl = value - holding.invested;
  const pc = vibeColors(pl > 1 ? "green" : pl < -1 ? "red" : "yellow");
  const company = companies.find((c) => c.symbol === holding.symbol);
  const initial = holding.name.trim().charAt(0).toUpperCase() || "?";
  const sharesLabel = `${holding.quantity} ${holding.quantity === 1 ? "share" : "shares"}`;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: 16,
        background: "#FFFDF9",
        border: "1px solid rgba(120,105,80,.12)",
        borderRadius: 20,
        boxShadow: "0 12px 34px -30px rgba(80,65,40,.45)",
        flexWrap: "wrap",
      }}
    >
      <span
        style={{
          flex: "none",
          width: 46,
          height: 46,
          borderRadius: 14,
          background: company?.logoBg ?? "#EDE7DA",
          color: company?.logoColor ?? "#6A6155",
          display: "grid",
          placeItems: "center",
          fontFamily: "var(--font-quicksand), sans-serif",
          fontWeight: 700,
          fontSize: 21,
        }}
      >
        {company?.logo ?? initial}
      </span>
      <div style={{ flex: 1, minWidth: 130 }}>
        <div
          style={{
            fontFamily: "var(--font-quicksand), sans-serif",
            fontWeight: 700,
            fontSize: 17,
            color: "#2B2620",
          }}
        >
          {holding.name}
        </div>
        <div style={{ fontSize: 13.5, fontWeight: 600, color: "#9A907E" }}>{`${sharesLabel} · paid ~₹${fmt(Math.round(holding.avgPrice))} → now ₹${fmt(Math.round(currentPrice))}${live.status !== "ready" ? " (no live price)" : ""}`}</div>
      </div>
      <div style={{ textAlign: "right" }}>
        <div
          style={{
            fontFamily: "var(--font-quicksand), sans-serif",
            fontWeight: 700,
            fontSize: 18,
            color: "#2B2620",
            marginBottom: 4,
          }}
        >
          {`₹${fmt(Math.round(value))}`}
        </div>
        <div
          style={{
            display: "inline-flex",
            padding: "5px 11px",
            borderRadius: 999,
            background: pc.bg,
            color: pc.text,
            fontWeight: 700,
            fontSize: 12.5,
          }}
        >
          {`${pl >= 0 ? "▲ +₹" : "▼ ₹"}${fmt(Math.abs(Math.round(pl)))} on paper`}
        </div>
      </div>
      <button
        onClick={() => onTrade(holding.symbol, holding.name)}
        style={{
          flex: "none",
          fontFamily: "var(--font-quicksand), sans-serif",
          fontWeight: 700,
          fontSize: 13.5,
          color: "color-mix(in srgb, var(--accent, #4F9D69) 80%, #2E2922)",
          background: "color-mix(in srgb, var(--accent, #4F9D69) 14%, #fff)",
          border: "1.5px solid color-mix(in srgb, var(--accent, #4F9D69) 35%, transparent)",
          cursor: "pointer",
          padding: "9px 14px",
          borderRadius: 999,
        }}
      >
        Trade
      </button>
    </div>
  );
}
