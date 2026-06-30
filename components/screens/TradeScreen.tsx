"use client";

import { useCallback, useState } from "react";
import { companies, fmt, type Stat } from "@/lib/nudge-data";
import { useLiveStock } from "@/lib/useLiveStock";
import CompanySearchInput from "@/components/CompanySearchInput";
import Tooltip from "@/components/Tooltip";
import HoldingRow from "@/components/screens/trade/HoldingRow";
import type { Wallet } from "@/lib/wallet";
import type { SymbolSearchResult } from "@/lib/yahooFinance";

type Tab = "buy" | "sell";
type OrderType = "market" | "limit";

const termLabelStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 4,
  fontFamily: "var(--font-quicksand), sans-serif",
  fontWeight: 700,
  fontSize: 12.5,
  letterSpacing: ".4px",
  textTransform: "uppercase",
  color: "#A89E8B",
};

function TermLabel({ text }: { text: string }) {
  return (
    <span style={termLabelStyle}>
      {text}
      <span style={{ fontSize: 11, opacity: 0.75 }}>ⓘ</span>
    </span>
  );
}

export default function TradeScreen({
  wallet,
  onBuy,
  onSell,
  onReset,
  onExplore,
}: {
  wallet: Wallet;
  onBuy: (symbol: string, name: string, quantity: number, price: number) => boolean;
  onSell: (symbol: string, quantity: number, price: number) => boolean;
  onReset: () => void;
  onExplore: () => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
  const [selectedName, setSelectedName] = useState("");
  const [tab, setTab] = useState<Tab>("buy");
  const [orderType, setOrderType] = useState<OrderType>("market");
  const [qty, setQty] = useState(1);
  const [limitPrice, setLimitPrice] = useState(0);
  const [lastTrade, setLastTrade] = useState<string | null>(null);
  const [livePrices, setLivePrices] = useState<Record<string, number>>({});

  const handlePriceResolved = useCallback((symbol: string, price: number) => {
    setLivePrices((prev) => (prev[symbol] === price ? prev : { ...prev, [symbol]: price }));
  }, []);

  const selectForTrade = (symbol: string, name: string, nextTab: Tab) => {
    setSelectedSymbol(symbol);
    setSelectedName(name);
    setTab(nextTab);
    setOrderType("market");
    setQty(1);
    setLimitPrice(0);
    setLastTrade(null);
  };

  const handlePresetPick = (symbol: string, name: string) => {
    setSearchQuery(name);
    selectForTrade(symbol, name, "buy");
  };

  const handleSearchPick = (result: SymbolSearchResult) => {
    setSearchQuery(result.name);
    selectForTrade(result.symbol, result.name, "buy");
  };

  const handleHoldingTrade = (symbol: string, name: string) => {
    setSearchQuery(name);
    selectForTrade(symbol, name, "sell");
  };

  const live = useLiveStock(selectedSymbol ?? "");
  const marketPrice = selectedSymbol ? live.data?.price ?? null : null;
  const holding = selectedSymbol ? wallet.holdings[selectedSymbol] : undefined;
  const effectivePrice =
    orderType === "limit" ? (limitPrice > 0 ? limitPrice : null) : marketPrice;

  const totalAmount = effectivePrice !== null ? qty * effectivePrice : null;
  const resultingCash =
    totalAmount !== null
      ? tab === "buy"
        ? wallet.cash - totalAmount
        : wallet.cash + totalAmount
      : null;

  let blockReason: string | null = null;
  if (!selectedSymbol) {
    blockReason = "Search a company above, or tap Trade on a holding below, to get started.";
  } else if (tab === "sell" && !holding) {
    blockReason = `You don't own any ${selectedName} yet — switch to Buy to start a position.`;
  } else if (!Number.isFinite(qty) || qty < 1) {
    blockReason = "Enter a quantity of at least 1.";
  } else if (tab === "sell" && holding && qty > holding.quantity) {
    blockReason = `You only have ${holding.quantity} ${holding.quantity === 1 ? "share" : "shares"} to sell.`;
  } else if (orderType === "market" && marketPrice === null) {
    blockReason = `We don't have a live price for ${selectedName} right now — try again in a moment, or switch to a limit order.`;
  } else if (orderType === "limit" && (!limitPrice || limitPrice <= 0)) {
    blockReason = "Set a target price for your limit order.";
  } else if (tab === "buy" && resultingCash !== null && resultingCash < 0) {
    blockReason = "That's more than your cash balance — lower the quantity.";
  }

  const canConfirm = blockReason === null;

  const handleConfirm = () => {
    if (!canConfirm || !selectedSymbol || effectivePrice === null) return;
    const ok =
      tab === "buy"
        ? onBuy(selectedSymbol, selectedName, qty, effectivePrice)
        : onSell(selectedSymbol, qty, effectivePrice);
    if (!ok) return;
    setLastTrade(
      `✓ ${tab === "buy" ? "Bought" : "Sold"} ${qty} ${qty === 1 ? "share" : "shares"} of ${selectedName} at ₹${fmt(effectivePrice)}.`
    );
    setQty(1);
    if (tab === "sell" && holding && qty >= holding.quantity) {
      // fully sold out — nothing left to sell, drop back to buy
      setTab("buy");
    }
  };

  const handleQtyChange = (raw: string) => {
    const n = Math.floor(Number(raw));
    if (!Number.isFinite(n)) {
      setQty(1);
      return;
    }
    const max = tab === "sell" && holding ? holding.quantity : undefined;
    setQty(Math.min(Math.max(n, 1), max ?? Math.max(n, 1)));
  };

  const orderTerms: Stat[] = [
    {
      key: "ltp",
      label: "LTP / current price",
      value: marketPrice !== null ? `₹${fmt(marketPrice)}` : "—",
      explain:
        'LTP means "last traded price" — the most recent price this stock changed hands at. that\'s what "current price" means here too.',
    },
  ];
  if (holding) {
    orderTerms.push({
      key: "avgcost",
      label: "Avg cost",
      value: `₹${fmt(Math.round(holding.avgPrice))}`,
      explain:
        "the average price you've paid per share for this stock, blended across all your buys.",
    });
  }

  // Aggregate holdings using live prices where resolved, falling back to
  // avg cost until each HoldingRow's own fetch reports in.
  const holdingsList = Object.values(wallet.holdings);
  const investedValue = holdingsList.reduce(
    (a, h) => a + h.quantity * (livePrices[h.symbol] ?? h.avgPrice),
    0
  );
  const total = wallet.cash + investedValue;
  const totalPL = total - 10000;
  const totalPLLabel = `${totalPL >= 0 ? "▲ +₹" : "▼ ₹"}${fmt(Math.abs(Math.round(totalPL)))} since you started`;

  return (
    <main
      style={{
        maxWidth: 720,
        margin: "0 auto",
        padding: "clamp(28px, 5vw, 52px) 22px 80px",
      }}
    >
      <h2
        style={{
          fontFamily: "var(--font-quicksand), sans-serif",
          fontWeight: 700,
          fontSize: "clamp(26px, 4vw, 36px)",
          letterSpacing: "-.6px",
          margin: "0 0 8px",
          color: "#2B2620",
        }}
      >
        Your practice wallet
      </h2>
      <p
        style={{
          fontSize: 17,
          color: "#6A6155",
          margin: "0 0 24px",
          fontWeight: 500,
          lineHeight: 1.5,
        }}
      >
        Fake ₹10,000. Real prices. Zero risk. It lives on this device — no
        login, nothing to lose.
      </p>

      {/* Wallet summary */}
      <div
        style={{
          background:
            "linear-gradient(135deg, color-mix(in srgb, var(--accent, #4F9D69) 16%, #FFFDF9), #FFFDF9)",
          border: "1px solid color-mix(in srgb, var(--accent, #4F9D69) 22%, transparent)",
          borderRadius: "calc(var(--radius, 24px) + 8px)",
          padding: "clamp(22px, 4vw, 30px)",
          boxShadow: "0 26px 60px -36px rgba(80,65,40,.5)",
          marginBottom: 26,
        }}
      >
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
          <div>
            <div
              style={{
                fontSize: 12.5,
                fontWeight: 700,
                letterSpacing: ".4px",
                textTransform: "uppercase",
                color: "#A89E8B",
                marginBottom: 5,
              }}
            >
              Cash left
            </div>
            <div
              style={{
                fontFamily: "var(--font-quicksand), sans-serif",
                fontWeight: 700,
                fontSize: "clamp(20px, 3.4vw, 26px)",
                color: "#2B2620",
              }}
            >
              ₹{fmt(Math.round(wallet.cash))}
            </div>
          </div>
          <div>
            <div
              style={{
                fontSize: 12.5,
                fontWeight: 700,
                letterSpacing: ".4px",
                textTransform: "uppercase",
                color: "#A89E8B",
                marginBottom: 5,
              }}
            >
              Invested
            </div>
            <div
              style={{
                fontFamily: "var(--font-quicksand), sans-serif",
                fontWeight: 700,
                fontSize: "clamp(20px, 3.4vw, 26px)",
                color: "#2B2620",
              }}
            >
              ₹{fmt(Math.round(investedValue))}
            </div>
          </div>
          <div>
            <div
              style={{
                fontSize: 12.5,
                fontWeight: 700,
                letterSpacing: ".4px",
                textTransform: "uppercase",
                color: "#A89E8B",
                marginBottom: 5,
              }}
            >
              Total
            </div>
            <div
              style={{
                fontFamily: "var(--font-quicksand), sans-serif",
                fontWeight: 700,
                fontSize: "clamp(20px, 3.4vw, 26px)",
                color: "var(--accent, #4F9D69)",
              }}
            >
              ₹{fmt(Math.round(total))}
            </div>
          </div>
        </div>

        <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          {totalPL > 1 && (
            <div
              style={{
                display: "inline-flex",
                padding: "7px 14px",
                borderRadius: 999,
                background: "#E9F4EC",
                color: "#36774A",
                fontFamily: "var(--font-quicksand), sans-serif",
                fontWeight: 700,
                fontSize: 14,
              }}
            >
              {totalPLLabel}
            </div>
          )}
          {totalPL < -1 && (
            <div
              style={{
                display: "inline-flex",
                padding: "7px 14px",
                borderRadius: 999,
                background: "#FBECE4",
                color: "#A8512F",
                fontFamily: "var(--font-quicksand), sans-serif",
                fontWeight: 700,
                fontSize: 14,
              }}
            >
              {totalPLLabel}
            </div>
          )}
          {totalPL >= -1 && totalPL <= 1 && (
            <div
              style={{
                display: "inline-flex",
                padding: "7px 14px",
                borderRadius: 999,
                background: "#F1ECE1",
                color: "#8A8072",
                fontFamily: "var(--font-quicksand), sans-serif",
                fontWeight: 700,
                fontSize: 14,
              }}
            >
              Right where you started — go try a buy 🙂
            </div>
          )}
          <Tooltip
            label="P&L"
            explain='short for "profit and loss" — how much more (or less) your shares are worth right now than what you paid for them.'
          >
            <TermLabel text="P&L" />
          </Tooltip>
        </div>
      </div>

      {/* Order panel */}
      <section
        style={{
          background: "#FFFDF9",
          border: "1px solid rgba(120,105,80,.12)",
          borderRadius: "calc(var(--radius, 24px) + 8px)",
          padding: "clamp(20px, 4vw, 28px)",
          boxShadow: "0 18px 50px -34px rgba(80,65,40,.4)",
          marginBottom: 18,
        }}
      >
        <h3
          style={{
            fontFamily: "var(--font-quicksand), sans-serif",
            fontWeight: 700,
            fontSize: 19,
            margin: "0 0 14px",
            color: "#2B2620",
          }}
        >
          Buy &amp; sell
        </h3>

        <CompanySearchInput query={searchQuery} onQueryChange={setSearchQuery} onPick={handleSearchPick} />

        <div style={{ display: "flex", flexWrap: "wrap", gap: 9, margin: "14px 0 20px" }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#A89E8B", alignSelf: "center", marginRight: 2 }}>
            try:
          </span>
          {companies.map((c) => {
            const active = selectedSymbol === c.symbol;
            return (
              <button
                key={c.symbol}
                onClick={() => handlePresetPick(c.symbol, c.name)}
                style={{
                  fontFamily: "var(--font-nunito), sans-serif",
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: "pointer",
                  padding: "9px 16px",
                  borderRadius: 999,
                  border: `1.5px solid ${
                    active
                      ? "color-mix(in srgb, var(--accent, #4F9D69) 45%, transparent)"
                      : "rgba(120,105,80,.18)"
                  }`,
                  background: active
                    ? "color-mix(in srgb, var(--accent, #4F9D69) 14%, #fff)"
                    : "#FBF7EF",
                  color: active
                    ? "color-mix(in srgb, var(--accent, #4F9D69) 80%, #2E2922)"
                    : "#6A6155",
                  transition: "all .16s ease",
                }}
              >
                {c.name}
              </button>
            );
          })}
        </div>

        {!selectedSymbol ? (
          <div
            style={{
              padding: "18px 16px",
              background: "#F1ECE1",
              borderRadius: 16,
              fontSize: 15,
              fontWeight: 600,
              color: "#6A6155",
              lineHeight: 1.5,
            }}
          >
            {blockReason}
          </div>
        ) : (
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                flexWrap: "wrap",
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-quicksand), sans-serif",
                  fontWeight: 700,
                  fontSize: 18,
                  color: "#2B2620",
                }}
              >
                {selectedName}
              </div>
              {holding && (
                <div style={{ fontSize: 13, fontWeight: 700, color: "#9A907E" }}>
                  {`you hold ${holding.quantity} ${holding.quantity === 1 ? "share" : "shares"}`}
                </div>
              )}
            </div>

            {/* Buy / Sell tabs */}
            <div
              style={{
                display: "inline-flex",
                padding: 4,
                background: "#F1ECE1",
                borderRadius: 999,
                marginBottom: 18,
              }}
            >
              <button
                onClick={() => setTab("buy")}
                style={{
                  fontFamily: "var(--font-quicksand), sans-serif",
                  fontWeight: 700,
                  fontSize: 14.5,
                  cursor: "pointer",
                  border: "none",
                  padding: "9px 20px",
                  borderRadius: 999,
                  background: tab === "buy" ? "var(--accent, #4F9D69)" : "transparent",
                  color: tab === "buy" ? "#fff" : "#6A6155",
                }}
              >
                Buy
              </button>
              <button
                onClick={() => holding && setTab("sell")}
                disabled={!holding}
                style={{
                  fontFamily: "var(--font-quicksand), sans-serif",
                  fontWeight: 700,
                  fontSize: 14.5,
                  cursor: holding ? "pointer" : "not-allowed",
                  border: "none",
                  padding: "9px 20px",
                  borderRadius: 999,
                  background: tab === "sell" ? "#D17A5A" : "transparent",
                  color: tab === "sell" ? "#fff" : holding ? "#6A6155" : "#C3B9A6",
                }}
              >
                Sell
              </button>
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {orderTerms.map((term) => (
                <Tooltip key={term.key} label={term.label} explain={term.explain}>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 3,
                      padding: "13px 15px",
                      borderRadius: 16,
                      background: "#FBF7EF",
                      border: "1.5px solid rgba(120,105,80,.16)",
                      minWidth: 118,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 11.5,
                        fontWeight: 700,
                        letterSpacing: ".4px",
                        textTransform: "uppercase",
                        color: "#A89E8B",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      {term.label}
                      <span style={{ fontSize: 11, opacity: 0.75 }}>ⓘ</span>
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--font-quicksand), sans-serif",
                        fontWeight: 700,
                        fontSize: 20,
                        color: "#2B2620",
                      }}
                    >
                      {term.value}
                    </span>
                  </div>
                </Tooltip>
              ))}
            </div>

            {/* Quantity */}
            <div style={{ marginTop: 18 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 7 }}>
                <Tooltip
                  label="Qty"
                  explain="how many shares you want to buy or sell. whole numbers only — no fractional shares here."
                >
                  <TermLabel text="Qty" />
                </Tooltip>
                {tab === "sell" && holding && (
                  <button
                    onClick={() => setQty(holding.quantity)}
                    style={{
                      fontFamily: "var(--font-nunito), sans-serif",
                      fontWeight: 700,
                      fontSize: 12.5,
                      color: "var(--accent, #4F9D69)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                    }}
                  >
                    sell all ({holding.quantity})
                  </button>
                )}
              </div>
              <input
                type="number"
                min={1}
                max={tab === "sell" && holding ? holding.quantity : undefined}
                value={qty}
                onChange={(e) => handleQtyChange(e.target.value)}
                style={{
                  width: "100%",
                  fontFamily: "var(--font-quicksand), sans-serif",
                  fontWeight: 700,
                  fontSize: 22,
                  color: "#2B2620",
                  background: "#FBF7EF",
                  border: "1.5px solid rgba(120,105,80,.16)",
                  borderRadius: 14,
                  padding: "12px 16px",
                }}
              />
            </div>

            {/* Order type */}
            <div style={{ marginTop: 18 }}>
              <div style={{ display: "flex", gap: 18, flexWrap: "wrap", marginBottom: 10 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 7, cursor: "pointer" }}>
                  <input
                    type="radio"
                    checked={orderType === "market"}
                    onChange={() => setOrderType("market")}
                    style={{ accentColor: "var(--accent, #4F9D69)" }}
                  />
                  <Tooltip
                    label="Market order"
                    explain="buy or sell right now, at whatever the current price is. instant and simple — what most beginners use."
                  >
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        fontFamily: "var(--font-quicksand), sans-serif",
                        fontWeight: 700,
                        fontSize: 12.5,
                        letterSpacing: ".4px",
                        textTransform: "uppercase",
                        color: orderType === "market" ? "#2B2620" : "#A89E8B",
                      }}
                    >
                      Market order
                      <span style={{ fontSize: 11, opacity: 0.75 }}>ⓘ</span>
                    </span>
                  </Tooltip>
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 7, cursor: "pointer" }}>
                  <input
                    type="radio"
                    checked={orderType === "limit"}
                    onChange={() => {
                      setOrderType("limit");
                      if (!limitPrice && marketPrice) setLimitPrice(marketPrice);
                    }}
                    style={{ accentColor: "var(--accent, #4F9D69)" }}
                  />
                  <Tooltip
                    label="Limit order"
                    explain="you name the exact price you're willing to trade at, instead of taking the market price. in real apps this waits until the market reaches your price — here it fills right away at your price, just so you can see how the math works."
                  >
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        fontFamily: "var(--font-quicksand), sans-serif",
                        fontWeight: 700,
                        fontSize: 12.5,
                        letterSpacing: ".4px",
                        textTransform: "uppercase",
                        color: orderType === "limit" ? "#2B2620" : "#A89E8B",
                      }}
                    >
                      Limit order
                      <span style={{ fontSize: 11, opacity: 0.75 }}>ⓘ</span>
                    </span>
                  </Tooltip>
                </label>
              </div>
              {orderType === "limit" && (
                <input
                  type="number"
                  min={0.01}
                  step={0.05}
                  value={limitPrice || ""}
                  onChange={(e) => setLimitPrice(Number(e.target.value))}
                  placeholder="your target price"
                  style={{
                    marginTop: 10,
                    width: "100%",
                    fontFamily: "var(--font-quicksand), sans-serif",
                    fontWeight: 700,
                    fontSize: 18,
                    color: "#2B2620",
                    background: "#FBF7EF",
                    border: "1.5px solid rgba(120,105,80,.16)",
                    borderRadius: 14,
                    padding: "12px 16px",
                  }}
                />
              )}
            </div>

            {/* Totals preview */}
            <div
              style={{
                marginTop: 18,
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: 10,
              }}
            >
              <div style={{ padding: "12px 14px", borderRadius: 14, background: "#F4F0E7" }}>
                <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: ".4px", textTransform: "uppercase", color: "#A89E8B" }}>
                  {tab === "buy" ? "Total cost" : "Total proceeds"}
                </div>
                <div style={{ fontFamily: "var(--font-quicksand), sans-serif", fontWeight: 700, fontSize: 18, color: "#2B2620" }}>
                  {totalAmount !== null ? `₹${fmt(Math.round(totalAmount))}` : "—"}
                </div>
              </div>
              <div style={{ padding: "12px 14px", borderRadius: 14, background: "#F4F0E7" }}>
                <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: ".4px", textTransform: "uppercase", color: "#A89E8B" }}>
                  Cash after
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-quicksand), sans-serif",
                    fontWeight: 700,
                    fontSize: 18,
                    color: resultingCash !== null && resultingCash < 0 ? "#A8512F" : "#2B2620",
                  }}
                >
                  {resultingCash !== null ? `₹${fmt(Math.round(resultingCash))}` : "—"}
                </div>
              </div>
            </div>

            <button
              onClick={handleConfirm}
              disabled={!canConfirm}
              style={{
                marginTop: 18,
                width: "100%",
                fontFamily: "var(--font-quicksand), sans-serif",
                fontWeight: 700,
                fontSize: 16,
                color: "#fff",
                background: canConfirm ? (tab === "buy" ? "var(--accent, #4F9D69)" : "#D17A5A") : "#C3B9A6",
                border: "none",
                cursor: canConfirm ? "pointer" : "not-allowed",
                padding: "14px 24px",
                borderRadius: 999,
                boxShadow: canConfirm
                  ? `0 12px 26px color-mix(in srgb, ${tab === "buy" ? "var(--accent, #4F9D69)" : "#D17A5A"} 36%, transparent)`
                  : "none",
              }}
            >
              {tab === "buy" ? `Buy ${qty} ${qty === 1 ? "share" : "shares"}` : `Sell ${qty} ${qty === 1 ? "share" : "shares"}`}
            </button>

            {blockReason && (
              <p style={{ marginTop: 10, fontSize: 13.5, fontWeight: 700, color: "#9A7320", lineHeight: 1.5 }}>
                {blockReason}
              </p>
            )}
            {!blockReason && lastTrade && (
              <p style={{ marginTop: 10, fontSize: 14, fontWeight: 700, color: "#36774A", lineHeight: 1.5 }}>
                {lastTrade}
              </p>
            )}
          </div>
        )}
      </section>

      {/* Holdings */}
      <h3
        style={{
          fontFamily: "var(--font-quicksand), sans-serif",
          fontWeight: 700,
          fontSize: 19,
          margin: "0 0 14px",
          color: "#2B2620",
        }}
      >
        Your holdings
      </h3>
      {holdingsList.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 28 }}>
          {holdingsList.map((h) => (
            <HoldingRow key={h.symbol} holding={h} onTrade={handleHoldingTrade} onPriceResolved={handlePriceResolved} />
          ))}
        </div>
      ) : (
        <div
          style={{
            textAlign: "center",
            padding: "40px 24px",
            background: "#FFFDF9",
            border: "1px dashed rgba(120,105,80,.25)",
            borderRadius: "calc(var(--radius, 24px) + 4px)",
            marginBottom: 28,
          }}
        >
          <div style={{ fontSize: 32, marginBottom: 10 }}>🌱</div>
          <p style={{ fontSize: 16.5, fontWeight: 600, color: "#6A6155", margin: "0 0 18px", lineHeight: 1.5 }}>
            No practice trades yet.
            <br />
            Pick a company above and try your very first buy.
          </p>
          <button
            onClick={onExplore}
            style={{
              fontFamily: "var(--font-quicksand), sans-serif",
              fontWeight: 700,
              fontSize: 16,
              color: "#fff",
              background: "var(--accent, #4F9D69)",
              border: "none",
              cursor: "pointer",
              padding: "14px 24px",
              borderRadius: 999,
              boxShadow: "0 12px 26px color-mix(in srgb, var(--accent, #4F9D69) 36%, transparent)",
            }}
          >
            Find a company to try &nbsp;→
          </button>
        </div>
      )}

      <div style={{ textAlign: "center" }}>
        <button
          onClick={onReset}
          style={{
            fontFamily: "var(--font-quicksand), sans-serif",
            fontWeight: 700,
            fontSize: 14,
            color: "#9A907E",
            background: "none",
            border: "1.5px solid rgba(120,105,80,.2)",
            cursor: "pointer",
            padding: "11px 20px",
            borderRadius: 999,
          }}
        >
          ↺ Reset wallet to ₹10,000
        </button>
      </div>
    </main>
  );
}
