"use client";

import { useState } from "react";
import { companies, fmt, formatMarketCapINR, vibeColors, type Row, type Stat, type Vibe } from "@/lib/nudge-data";
import { useLiveStock } from "@/lib/useLiveStock";
import CompanySearchInput from "@/components/CompanySearchInput";
import TappableTerms from "@/components/TappableTerms";
import type { SymbolSearchResult } from "@/lib/yahooFinance";

interface ExploreScreenProps {
  companyIdx: number;
  onSelectCompany: (i: number) => void;
  onResetSelection: () => void;
  amount: number;
  onAmountChange: (n: number) => void;
  openStat: string | null;
  onToggleStat: (key: string) => void;
  walkStep: number;
  onOpenWalk: () => void;
  onWalkNext: () => void;
  onWalkPrev: () => void;
  onCloseWalk: () => void;
  onConfirmBuy: (price: number) => void;
  onGoTrade: () => void;
}

interface SelectedView {
  name: string;
  symbol: string;
  logo: string;
  logoBg: string;
  logoColor: string;
  sector: string | null;
  vibe: Vibe | null;
  vibeLabel: string | null;
  staticPrice: number | null;
  stats: Stat[];
  rows: Row[];
  isPreset: boolean;
}

// Generic, company-agnostic definitions used for searched companies that
// have no static narrative — never borrowed from another company's copy.
const GENERIC_STATS: Stat[] = [
  {
    key: "pe",
    label: "P / E ratio",
    value: "—",
    explain: "how pricey the stock is vs what it actually earns. lower usually means cheaper relative to earnings.",
  },
  {
    key: "mcap",
    label: "Market cap",
    value: "—",
    explain: "the total value of the whole company, based on its current share price.",
  },
  {
    key: "high",
    label: "52-wk high",
    value: "—",
    explain: "the highest price this stock has traded at in the last year.",
  },
  {
    key: "low",
    label: "52-wk low",
    value: "—",
    explain: "the lowest price this stock has traded at in the last year.",
  },
];

function searchedToSelected(result: SymbolSearchResult): SelectedView {
  const initial = result.name.trim().charAt(0).toUpperCase() || "?";
  const sectorLabel = [result.sector, result.industry].filter(Boolean).join(" · ");
  return {
    name: result.name,
    symbol: result.symbol,
    logo: initial,
    logoBg: "#EDE7DA",
    logoColor: "#6A6155",
    sector: sectorLabel || result.exchange || null,
    vibe: null,
    vibeLabel: null,
    staticPrice: null,
    stats: GENERIC_STATS,
    rows: [],
    isPreset: false,
  };
}

export default function ExploreScreen({
  companyIdx,
  onSelectCompany,
  onResetSelection,
  amount,
  onAmountChange,
  openStat,
  onToggleStat,
  walkStep,
  onOpenWalk,
  onWalkNext,
  onWalkPrev,
  onCloseWalk,
  onConfirmBuy,
  onGoTrade,
}: ExploreScreenProps) {
  const presetCompany = companies[companyIdx] ?? companies[0];
  const [searchedCompany, setSearchedCompany] = useState<SymbolSearchResult | null>(null);
  const [searchQuery, setSearchQuery] = useState(presetCompany.name);

  const selected: SelectedView = searchedCompany
    ? searchedToSelected(searchedCompany)
    : {
        name: presetCompany.name,
        symbol: presetCompany.symbol,
        logo: presetCompany.logo,
        logoBg: presetCompany.logoBg,
        logoColor: presetCompany.logoColor,
        sector: presetCompany.sector,
        vibe: presetCompany.vibe,
        vibeLabel: presetCompany.vibeLabel,
        staticPrice: presetCompany.price,
        stats: presetCompany.stats,
        rows: presetCompany.rows,
        isPreset: true,
      };

  const vc = selected.vibe ? vibeColors(selected.vibe) : null;
  const live = useLiveStock(selected.symbol);
  const price = live.data?.price ?? selected.staticPrice;
  const safePrice = price ?? 0;

  const simShares = price !== null ? Math.floor(amount / price) : 0;
  const simInvested = price !== null ? simShares * price : 0;
  const simEnough = price !== null && simShares >= 1;
  const sWord = simShares === 1 ? "share" : "shares";

  const liveStatValues: Partial<Record<string, string>> = {
    pe: live.data?.peRatio != null ? String(Math.round(live.data.peRatio)) : undefined,
    mcap: live.data?.marketCap != null ? formatMarketCapINR(live.data.marketCap) : undefined,
    high: live.data?.week52High != null ? `₹${fmt(Math.round(live.data.week52High))}` : undefined,
    low: live.data?.week52Low != null ? `₹${fmt(Math.round(live.data.week52Low))}` : undefined,
  };

  const walkMap: Record<number, { n: string; title: string; body: string }> = {
    1: {
      n: "1",
      title: "First, how much",
      body: `You've set ₹${fmt(amount)}. At ₹${fmt(safePrice)} a share, that buys ${simShares} ${sWord} of ${selected.name}.`,
    },
    2: {
      n: "2",
      title: "Pick the order type",
      body: 'We\'ll use a "market" order — that just means buy right now, at the current price. Simple and instant. (The other kind lets you name your own price, but skip that for now.)',
    },
    3: {
      n: "3",
      title: "Review it",
      body: `${simShares} ${sWord} of ${selected.name} at ₹${fmt(safePrice)} = ₹${fmt(simInvested)}. Remember — this is practice money, nothing real leaves your pocket.`,
    },
    4: {
      n: "4",
      title: "Tap confirm",
      body: "That's the whole flow. In a real app the order fills in seconds and shows up in your portfolio. Ready to land it in your practice wallet?",
    },
  };
  const walk = walkMap[walkStep] ?? walkMap[1];
  const walkDoneBody = `You practice-bought ${simShares} ${sWord} of ${selected.name}. It’s sitting in your wallet now.`;

  const pickPreset = (i: number) => {
    setSearchedCompany(null);
    setSearchQuery(companies[i].name);
    onSelectCompany(i);
  };

  const pickSearchResult = (result: SymbolSearchResult) => {
    // Compare base ticker only (ignore .NS/.BO) so picking either exchange
    // listing of a preset company (e.g. ETERNAL.BO or ETERNAL.NS) resolves
    // to the same rich preset card instead of only one of them matching.
    const baseTicker = (symbol: string) => symbol.split(".")[0];
    const presetIndex = companies.findIndex(
      (c) => baseTicker(c.symbol) === baseTicker(result.symbol)
    );
    if (presetIndex !== -1) {
      pickPreset(presetIndex);
      return;
    }
    setSearchedCompany(result);
    setSearchQuery(result.name);
    onResetSelection();
  };

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
        Look at a company together
      </h2>
      <p
        style={{
          fontSize: 17,
          color: "#6A6155",
          margin: "0 0 24px",
          fontWeight: 500,
        }}
      >
        Pick one you&apos;ve heard of. We&apos;ll break it down — no jargon.
      </p>

      <div style={{ marginBottom: 16 }}>
        <CompanySearchInput query={searchQuery} onQueryChange={setSearchQuery} onPick={pickSearchResult} />
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 9,
          marginBottom: 28,
        }}
      >
        <span
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: "#A89E8B",
            alignSelf: "center",
            marginRight: 2,
          }}
        >
          try:
        </span>
        {companies.map((c, i) => {
          const active = !searchedCompany && i === companyIdx;
          return (
            <button
              key={c.name}
              onClick={() => pickPreset(i)}
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
                  : "#FFFDF9",
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

      {/* The Nudge Card */}
      <article
        style={{
          background: "#FFFDF9",
          border: "1px solid rgba(120,105,80,.12)",
          borderRadius: "calc(var(--radius, 24px) + 8px)",
          padding: "clamp(22px, 4vw, 32px)",
          boxShadow:
            "0 30px 70px -34px rgba(80,65,40,.5), 0 4px 14px -8px rgba(80,65,40,.18)",
          animation: "nudgeRise .45s ease both",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 16,
            flexWrap: "wrap",
            marginBottom: 22,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span
              style={{
                width: 52,
                height: 52,
                borderRadius: 16,
                background: selected.logoBg,
                color: selected.logoColor,
                display: "grid",
                placeItems: "center",
                fontFamily: "var(--font-quicksand), sans-serif",
                fontWeight: 700,
                fontSize: 24,
              }}
            >
              {selected.logo}
            </span>
            <div>
              <div
                style={{
                  fontFamily: "var(--font-quicksand), sans-serif",
                  fontWeight: 700,
                  fontSize: 22,
                  color: "#2B2620",
                  lineHeight: 1.1,
                }}
              >
                {selected.name}
              </div>
              {selected.sector && (
                <div style={{ fontSize: 14, fontWeight: 600, color: "#9A907E" }}>
                  {selected.sector}
                </div>
              )}
              {live.status === "ready" && live.data && (
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    marginTop: 3,
                    color:
                      live.data.changePercent != null
                        ? live.data.changePercent >= 0
                          ? "#36774A"
                          : "#A8512F"
                        : "#9A907E",
                  }}
                >{`₹${fmt(live.data.price)}${
                  live.data.changePercent != null
                    ? ` ${live.data.changePercent >= 0 ? "▲" : "▼"} ${Math.abs(live.data.changePercent).toFixed(2)}%`
                    : ""
                } · live`}</div>
              )}
              {live.status === "unavailable" && (
                <div style={{ fontSize: 12.5, fontWeight: 700, marginTop: 3, color: "#B3A998" }}>
                  {selected.isPreset
                    ? "live data unavailable — showing reference figures"
                    : "live data unavailable for this one right now"}
                </div>
              )}
            </div>
          </div>
          {/* Vibe Meter — only for preset companies with a static judgment */}
          {vc && (
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 9,
                padding: "9px 16px 9px 13px",
                borderRadius: 999,
                background: vc.bg,
                border: `1.5px solid ${vc.border}`,
              }}
            >
              <span style={{ position: "relative", width: 12, height: 12 }}>
                <span
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: "50%",
                    background: vc.dot,
                  }}
                />
                <span
                  style={{
                    position: "absolute",
                    inset: -4,
                    borderRadius: "50%",
                    background: vc.dot,
                    opacity: 0.25,
                    animation: "bubbleIn 1.4s ease infinite alternate",
                  }}
                />
              </span>
              <span
                style={{
                  fontFamily: "var(--font-quicksand), sans-serif",
                  fontWeight: 700,
                  fontSize: 14.5,
                  color: vc.text,
                }}
              >
                {selected.vibeLabel}
              </span>
            </div>
          )}
        </div>

        {selected.rows.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {selected.rows.map((row) => (
              <div
                key={row.label}
                style={{
                  padding: "16px 0",
                  borderTop: "1px solid rgba(120,105,80,.1)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 7,
                  }}
                >
                  <span style={{ fontSize: 15 }}>{row.icon}</span>
                  <span
                    style={{
                      fontFamily: "var(--font-quicksand), sans-serif",
                      fontWeight: 700,
                      fontSize: 12.5,
                      letterSpacing: ".6px",
                      textTransform: "uppercase",
                      color: "#A89E8B",
                    }}
                  >
                    {row.label}
                  </span>
                </div>
                <p
                  style={{
                    margin: 0,
                    fontSize: 16.5,
                    lineHeight: 1.55,
                    fontWeight: 500,
                    color: "#423B33",
                  }}
                >
                  {row.text}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div
            style={{
              padding: "16px 0",
              borderTop: "1px solid rgba(120,105,80,.1)",
              fontSize: 15.5,
              lineHeight: 1.55,
              fontWeight: 500,
              color: "#6A6155",
            }}
          >{`We don't have a plain-language breakdown for ${selected.name} yet — here's what the live numbers below show.`}</div>
        )}

        <div
          style={{
            marginTop: 20,
            padding: "14px 16px",
            background: "color-mix(in srgb, var(--accent, #4F9D69) 9%, #fff)",
            borderRadius: 16,
            fontSize: 13.5,
            lineHeight: 1.5,
            fontWeight: 600,
            color: "#7A715F",
          }}
        >
          🙂 this isn&apos;t financial advice — always do your own research.
        </div>
      </article>

      {/* Tappable number cards */}
      <section
        style={{
          marginTop: 18,
          background: "#FFFDF9",
          border: "1px solid rgba(120,105,80,.12)",
          borderRadius: "calc(var(--radius, 24px) + 8px)",
          padding: "clamp(20px, 4vw, 28px)",
          boxShadow: "0 18px 50px -34px rgba(80,65,40,.4)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 10,
            flexWrap: "wrap",
            marginBottom: 14,
          }}
        >
          <h3
            style={{
              fontFamily: "var(--font-quicksand), sans-serif",
              fontWeight: 700,
              fontSize: 19,
              margin: 0,
              color: "#2B2620",
            }}
          >
            By the numbers
          </h3>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#A89E8B" }}>
            tap any to learn what it means
          </span>
        </div>
        <TappableTerms
          terms={selected.stats.map((stat) => ({ ...stat, value: liveStatValues[stat.key] ?? stat.value }))}
          activeKey={openStat}
          onToggle={onToggleStat}
        />
      </section>

      {/* ₹ simulator */}
      <section
        style={{
          marginTop: 18,
          background: "#FFFDF9",
          border: "1px solid rgba(120,105,80,.12)",
          borderRadius: "calc(var(--radius, 24px) + 8px)",
          padding: "clamp(20px, 4vw, 28px)",
          boxShadow: "0 18px 50px -34px rgba(80,65,40,.4)",
        }}
      >
        <h3
          style={{
            fontFamily: "var(--font-quicksand), sans-serif",
            fontWeight: 700,
            fontSize: 19,
            margin: "0 0 4px",
            color: "#2B2620",
          }}
        >
          What would your money buy?
        </h3>
        <p
          style={{
            fontSize: 15,
            color: "#6A6155",
            fontWeight: 500,
            margin: "0 0 18px",
          }}
        >
          {`Slide to see how much of ${selected.name} you'd get — and how it might move.`}
        </p>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 10,
            marginBottom: 14,
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-quicksand), sans-serif",
              fontWeight: 700,
              fontSize: 38,
              color: "var(--accent, #4F9D69)",
              lineHeight: 1,
            }}
          >
            ₹{fmt(amount)}
          </span>
          <span style={{ fontSize: 14, fontWeight: 700, color: "#A89E8B" }}>
            to try
          </span>
        </div>
        <input
          type="range"
          min={100}
          max={5000}
          step={100}
          value={amount}
          onChange={(e) => onAmountChange(Number(e.target.value))}
          style={{
            width: "100%",
            accentColor: "var(--accent, #4F9D69)",
            height: 6,
            cursor: "pointer",
          }}
        />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 12.5,
            fontWeight: 700,
            color: "#B3A998",
            marginTop: 4,
          }}
        >
          <span>₹100</span>
          <span>₹5,000</span>
        </div>
        {price === null ? (
          <div
            style={{
              marginTop: 16,
              padding: "14px 16px",
              background: "#F1ECE1",
              borderRadius: 16,
              fontSize: 15,
              fontWeight: 600,
              color: "#6A6155",
              lineHeight: 1.5,
            }}
          >{`We don't have a live price for ${selected.name} right now, so we can't simulate this one yet.`}</div>
        ) : simEnough ? (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 10,
                marginTop: 18,
              }}
            >
              <div
                style={{
                  padding: "14px 10px",
                  borderRadius: 16,
                  background: "#F4F0E7",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-quicksand), sans-serif",
                    fontWeight: 700,
                    fontSize: 26,
                    color: "#2B2620",
                  }}
                >
                  {simShares}
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#8A8072" }}>{sWord} you&apos;d own</div>
              </div>
              <div
                style={{
                  padding: "14px 10px",
                  borderRadius: 16,
                  background: "#E9F4EC",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-quicksand), sans-serif",
                    fontWeight: 700,
                    fontSize: 19,
                    color: "#36774A",
                  }}
                >
                  ₹{fmt(Math.round(simInvested * 1.1))}
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#5C9A6E" }}>
                  if it rises 10%
                </div>
              </div>
              <div
                style={{
                  padding: "14px 10px",
                  borderRadius: 16,
                  background: "#FBECE4",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-quicksand), sans-serif",
                    fontWeight: 700,
                    fontSize: 19,
                    color: "#A8512F",
                  }}
                >
                  ₹{fmt(Math.round(simInvested * 0.9))}
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#C07A5A" }}>
                  if it dips 10%
                </div>
              </div>
            </div>
            <p
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "#A89E8B",
                margin: "12px 0 0",
                textAlign: "center",
              }}
            >
              prices move every day — this is just to get a feel for it 🙂
            </p>
          </>
        ) : (
          <div
            style={{
              marginTop: 16,
              padding: "14px 16px",
              background: "#FBF1DC",
              borderRadius: 16,
              fontSize: 15,
              fontWeight: 600,
              color: "#9A7320",
              lineHeight: 1.5,
            }}
          >
            {`One share of ${selected.name} is ₹${fmt(safePrice)} — nudge the slider up a little to afford your first whole share.`}
          </div>
        )}
      </section>

      {/* First-buy walkthrough */}
      <section
        style={{
          marginTop: 18,
          background: "color-mix(in srgb, var(--accent, #4F9D69) 9%, #FFFDF9)",
          border: "1px solid color-mix(in srgb, var(--accent, #4F9D69) 20%, transparent)",
          borderRadius: "calc(var(--radius, 24px) + 8px)",
          padding: "clamp(22px, 4vw, 30px)",
        }}
      >
        {walkStep === 0 && (
          <div>
            <h3
              style={{
                fontFamily: "var(--font-quicksand), sans-serif",
                fontWeight: 700,
                fontSize: 20,
                margin: "0 0 6px",
                color: "#2B2620",
              }}
            >
              Curious what tapping &quot;Buy&quot; actually does?
            </h3>
            <p
              style={{
                fontSize: 15.5,
                color: "#5C544A",
                fontWeight: 500,
                margin: "0 0 18px",
                lineHeight: 1.5,
              }}
            >
              Walk through a practice buy, step by step. No real money — ever.
              Just so the real thing never feels scary.
            </p>
            {!selected.isPreset ? (
              <p style={{ fontSize: 14, fontWeight: 700, color: "#9A7320", margin: 0 }}>
                Practice-buy is available for our 3 starter picks for now — try Zomato, Infosys, or Tata Motors below to give it a go.
              </p>
            ) : simEnough ? (
              <button
                onClick={onOpenWalk}
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
                  boxShadow:
                    "0 12px 26px color-mix(in srgb, var(--accent, #4F9D69) 36%, transparent)",
                }}
              >
                Try a practice buy &nbsp;→
              </button>
            ) : (
              <p style={{ fontSize: 14, fontWeight: 700, color: "#9A7320", margin: 0 }}>{`Set the slider above ₹${fmt(safePrice)} to practice your first buy.`}</p>
            )}
          </div>
        )}
        {walkStep >= 1 && walkStep <= 4 && (
          <div style={{ animation: "bubbleIn .3s ease both" }}>
            <div
              style={{
                fontFamily: "var(--font-quicksand), sans-serif",
                fontWeight: 700,
                fontSize: 13,
                letterSpacing: ".5px",
                textTransform: "uppercase",
                color: "var(--accent, #4F9D69)",
                marginBottom: 8,
              }}
            >{`Step ${walk.n} of 4`}</div>
            <h3
              style={{
                fontFamily: "var(--font-quicksand), sans-serif",
                fontWeight: 700,
                fontSize: 21,
                margin: "0 0 8px",
                color: "#2B2620",
              }}
            >
              {walk.title}
            </h3>
            <p
              style={{
                fontSize: 16.5,
                lineHeight: 1.55,
                fontWeight: 500,
                color: "#4A4339",
                margin: "0 0 22px",
              }}
            >
              {walk.body}
            </p>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                flexWrap: "wrap",
              }}
            >
              {walkStep > 1 && walkStep <= 4 && (
                <button
                  onClick={onWalkPrev}
                  style={{
                    fontFamily: "var(--font-quicksand), sans-serif",
                    fontWeight: 700,
                    fontSize: 15,
                    color: "#6A6155",
                    background: "#F1ECE1",
                    border: "none",
                    cursor: "pointer",
                    padding: "12px 20px",
                    borderRadius: 999,
                  }}
                >
                  ← Back
                </button>
              )}
              {walkStep >= 1 && walkStep <= 3 && (
                <button
                  onClick={onWalkNext}
                  style={{
                    fontFamily: "var(--font-quicksand), sans-serif",
                    fontWeight: 700,
                    fontSize: 15,
                    color: "#fff",
                    background: "var(--accent, #4F9D69)",
                    border: "none",
                    cursor: "pointer",
                    padding: "12px 24px",
                    borderRadius: 999,
                    boxShadow:
                      "0 10px 22px color-mix(in srgb, var(--accent, #4F9D69) 34%, transparent)",
                  }}
                >
                  Next →
                </button>
              )}
              {walkStep === 4 && (
                <button
                  onClick={() => onConfirmBuy(safePrice)}
                  style={{
                    fontFamily: "var(--font-quicksand), sans-serif",
                    fontWeight: 700,
                    fontSize: 15,
                    color: "#fff",
                    background: "var(--accent, #4F9D69)",
                    border: "none",
                    cursor: "pointer",
                    padding: "12px 24px",
                    borderRadius: 999,
                    boxShadow:
                      "0 10px 22px color-mix(in srgb, var(--accent, #4F9D69) 34%, transparent)",
                  }}
                >
                  ✓ Confirm practice buy
                </button>
              )}
              <button
                onClick={onCloseWalk}
                style={{
                  fontFamily: "var(--font-quicksand), sans-serif",
                  fontWeight: 700,
                  fontSize: 14,
                  color: "#A89E8B",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "12px 8px",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
        {walkStep === 99 && (
          <div style={{ textAlign: "center", animation: "bubbleIn .35s ease both" }}>
            <div style={{ fontSize: 40, lineHeight: 1, marginBottom: 10 }}>🎉</div>
            <h3
              style={{
                fontFamily: "var(--font-quicksand), sans-serif",
                fontWeight: 700,
                fontSize: 22,
                margin: "0 0 8px",
                color: "#2B2620",
              }}
            >
              Done — that&apos;s a practice buy!
            </h3>
            <p
              style={{
                fontSize: 16,
                lineHeight: 1.5,
                fontWeight: 500,
                color: "#5C544A",
                margin: "0 auto 22px",
                maxWidth: 380,
              }}
            >
              {walkDoneBody}
            </p>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                flexWrap: "wrap",
              }}
            >
              <button
                onClick={onGoTrade}
                style={{
                  fontFamily: "var(--font-quicksand), sans-serif",
                  fontWeight: 700,
                  fontSize: 16,
                  color: "#fff",
                  background: "var(--accent, #4F9D69)",
                  border: "none",
                  cursor: "pointer",
                  padding: "14px 26px",
                  borderRadius: 999,
                  boxShadow:
                    "0 12px 26px color-mix(in srgb, var(--accent, #4F9D69) 36%, transparent)",
                }}
              >
                See my wallet &nbsp;→
              </button>
              <button
                onClick={onCloseWalk}
                style={{
                  fontFamily: "var(--font-quicksand), sans-serif",
                  fontWeight: 700,
                  fontSize: 15,
                  color: "#6A6155",
                  background: "#F1ECE1",
                  border: "none",
                  cursor: "pointer",
                  padding: "14px 22px",
                  borderRadius: 999,
                }}
              >
                Stay here
              </button>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
