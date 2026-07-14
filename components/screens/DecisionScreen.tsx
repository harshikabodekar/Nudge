"use client";

import { useState } from "react";
import { companies, fmt, vibeColors } from "@/lib/nudge-data";
import { useLiveStock } from "@/lib/useLiveStock";
import { matchGoalToCompany } from "@/lib/goalFit";
import type { Goal } from "@/lib/goal";
import type { SymbolSearchResult } from "@/lib/yahooFinance";
import PriceChart from "@/components/PriceChart";

interface DecisionScreenProps {
  companyIdx: number;
  searchedCompany: SymbolSearchResult | null;
  goal: Goal | null;
  onBack: () => void;
  onGoTrade: (symbol: string, name: string) => void;
}


function YearRangeBar({ low, high, current }: { low: number; high: number; current: number }) {
  const pct = Math.max(0, Math.min(100, ((current - low) / (high - low)) * 100));
  return (
    <div>
      <div style={{ fontFamily: "var(--font-quicksand), sans-serif", fontWeight: 700, fontSize: 15, color: "#2B2620", marginBottom: 12 }}>
        Where the price sits now
      </div>
      <div style={{ position: "relative", height: 8, background: "#F1ECE1", borderRadius: 999, margin: "0 0 8px" }}>
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            height: "100%",
            width: `${pct}%`,
            background: "linear-gradient(90deg, color-mix(in srgb, var(--accent, #4F9D69) 35%, #F1ECE1), var(--accent, #4F9D69))",
            borderRadius: 999,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: `${pct}%`,
            top: "50%",
            transform: "translate(-50%, -50%)",
            width: 16,
            height: 16,
            borderRadius: "50%",
            background: "var(--accent, #4F9D69)",
            boxShadow: "0 0 0 3px #fff, 0 0 0 5px color-mix(in srgb, var(--accent, #4F9D69) 30%, transparent)",
          }}
        />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, fontWeight: 700 }}>
        <span style={{ color: "#B3A998" }}>{`₹${fmt(Math.round(low))} · year low`}</span>
        <span style={{ color: "var(--accent, #4F9D69)" }}>{`₹${fmt(Math.round(current))} · now`}</span>
        <span style={{ color: "#B3A998" }}>{`₹${fmt(Math.round(high))} · year high`}</span>
      </div>
    </div>
  );
}

const SCENARIOS = [
  { label: "rises 30%", change: 0.30, gainColor: "#36774A", bg: "#E9F4EC", barColor: "#4F9D69" },
  { label: "rises 15%", change: 0.15, gainColor: "#4F9D69", bg: "#EFF7F2", barColor: "#7DC499" },
  { label: "rises 5%", change: 0.05, gainColor: "#5C9A6E", bg: "#F4FAF6", barColor: "#A8D4B5" },
  { label: "falls 5%", change: -0.05, gainColor: "#C07A5A", bg: "#FBF0EB", barColor: "#E8A98A" },
  { label: "falls 15%", change: -0.15, gainColor: "#A8512F", bg: "#FBE8E0", barColor: "#D17A5A" },
  { label: "falls 30%", change: -0.30, gainColor: "#8B3E22", bg: "#F9DED5", barColor: "#C05A38" },
] as const;

export default function DecisionScreen({
  companyIdx,
  searchedCompany,
  goal,
  onBack,
  onGoTrade,
}: DecisionScreenProps) {
  const preset = searchedCompany ? null : (companies[companyIdx] ?? companies[0]);
  const name = preset?.name ?? searchedCompany?.name ?? "Unknown";
  const symbol = preset?.symbol ?? searchedCompany?.symbol ?? "";

  const live = useLiveStock(symbol);
  const price = live.data?.price ?? preset?.price ?? null;

  const [amount, setAmount] = useState(500);

  const vc = preset?.vibe ? vibeColors(preset.vibe) : null;
  const goalFit = goal && preset ? matchGoalToCompany(goal, preset) : null;

  const goalFitColors = {
    good: { bg: "#E9F4EC", border: "#BFE0C8", text: "#36774A", icon: "✓" },
    caution: { bg: "#FBF1DC", border: "#EDD7A6", text: "#9A7320", icon: "⚠" },
    risky: { bg: "#FBE8E0", border: "#EFC8B7", text: "#A8512F", icon: "⛔" },
  };

  const shares = price !== null ? Math.floor(amount / price) : 0;
  const invested = shares * (price ?? 0);

  const week52High = live.data?.week52High ?? null;
  const week52Low = live.data?.week52Low ?? null;

  const cardStyle: React.CSSProperties = {
    background: "#FFFDF9",
    border: "1px solid rgba(120,105,80,.12)",
    borderRadius: "calc(var(--radius, 24px) + 6px)",
    padding: "clamp(20px, 4vw, 28px)",
    boxShadow: "0 18px 50px -34px rgba(80,65,40,.4)",
    marginBottom: 18,
  };

  return (
    <main
      style={{
        maxWidth: 720,
        margin: "0 auto",
        padding: "clamp(28px, 5vw, 52px) 22px 80px",
      }}
    >
      {/* Back + header */}
      <button
        onClick={onBack}
        style={{
          fontFamily: "var(--font-nunito), sans-serif",
          fontWeight: 700,
          fontSize: 14,
          color: "#7A715F",
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "0 0 18px",
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        ← back to Explore
      </button>

      {/* Company header */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 8, flexWrap: "wrap" }}>
        <span
          style={{
            width: 56,
            height: 56,
            borderRadius: 18,
            background: preset?.logoBg ?? "#EDE7DA",
            color: preset?.logoColor ?? "#6A6155",
            display: "grid",
            placeItems: "center",
            fontFamily: "var(--font-quicksand), sans-serif",
            fontWeight: 700,
            fontSize: 26,
            flexShrink: 0,
          }}
        >
          {preset?.logo ?? name.charAt(0).toUpperCase()}
        </span>
        <div>
          <h2
            style={{
              fontFamily: "var(--font-quicksand), sans-serif",
              fontWeight: 700,
              fontSize: "clamp(24px, 4vw, 32px)",
              letterSpacing: "-.5px",
              margin: 0,
              color: "#2B2620",
            }}
          >
            {name}
          </h2>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginTop: 4 }}>
            {preset?.sector && (
              <span style={{ fontSize: 14, fontWeight: 600, color: "#9A907E" }}>{preset.sector}</span>
            )}
            {vc && (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 7,
                  padding: "5px 12px 5px 9px",
                  borderRadius: 999,
                  background: vc.bg,
                  border: `1.5px solid ${vc.border}`,
                  fontFamily: "var(--font-quicksand), sans-serif",
                  fontWeight: 700,
                  fontSize: 13,
                  color: vc.text,
                }}
              >
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: vc.dot, display: "inline-block" }} />
                {preset?.vibeLabel}
              </span>
            )}
          </div>
        </div>
        {live.status === "ready" && live.data && price !== null && (
          <div style={{ marginLeft: "auto", textAlign: "right" }}>
            <div style={{ fontFamily: "var(--font-quicksand), sans-serif", fontWeight: 700, fontSize: 26, color: "#2B2620" }}>
              {`₹${fmt(Math.round(price))}`}
            </div>
            {live.data.changePercent !== null && (
              <div style={{ fontSize: 13, fontWeight: 700, color: live.data.changePercent >= 0 ? "#36774A" : "#A8512F" }}>
                {`${live.data.changePercent >= 0 ? "▲ +" : "▼ "}${Math.abs(live.data.changePercent).toFixed(2)}% today`}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Goal fit banner */}
      {goalFit && (
        <div
          style={{
            padding: "13px 16px",
            borderRadius: 16,
            background: goalFitColors[goalFit.verdict].bg,
            border: `1.5px solid ${goalFitColors[goalFit.verdict].border}`,
            fontSize: 14.5,
            fontWeight: 600,
            color: goalFitColors[goalFit.verdict].text,
            lineHeight: 1.5,
            display: "flex",
            gap: 10,
            alignItems: "flex-start",
            marginBottom: 18,
          }}
        >
          <span style={{ flexShrink: 0, fontSize: 16 }}>{goalFitColors[goalFit.verdict].icon}</span>
          <span>{goalFit.message}</span>
        </div>
      )}

      {/* Pros & Cons */}
      {preset && preset.pros.length > 0 && (
        <div style={cardStyle}>
          <h3
            style={{
              fontFamily: "var(--font-quicksand), sans-serif",
              fontWeight: 700,
              fontSize: 18,
              margin: "0 0 16px",
              color: "#2B2620",
            }}
          >
            Pros &amp; cons at a glance
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: ".5px", textTransform: "uppercase", color: "#4F9D69", marginBottom: 10 }}>
                What works in its favour
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {preset.pros.map((pro, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <span
                      style={{
                        flex: "none",
                        width: 22,
                        height: 22,
                        borderRadius: "50%",
                        background: "#E9F4EC",
                        display: "grid",
                        placeItems: "center",
                        fontSize: 12,
                        color: "#36774A",
                        fontWeight: 700,
                        marginTop: 1,
                      }}
                    >
                      ✓
                    </span>
                    <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5, fontWeight: 500, color: "#4A4339" }}>{pro}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: ".5px", textTransform: "uppercase", color: "#D17A5A", marginBottom: 10 }}>
                Things to watch out for
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {preset.cons.map((con, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <span
                      style={{
                        flex: "none",
                        width: 22,
                        height: 22,
                        borderRadius: "50%",
                        background: "#FBE8E0",
                        display: "grid",
                        placeItems: "center",
                        fontSize: 12,
                        color: "#A8512F",
                        fontWeight: 700,
                        marginTop: 1,
                      }}
                    >
                      !
                    </span>
                    <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5, fontWeight: 500, color: "#4A4339" }}>{con}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* What if? scenario table */}
      {price !== null && (
        <div style={cardStyle}>
          <h3
            style={{
              fontFamily: "var(--font-quicksand), sans-serif",
              fontWeight: 700,
              fontSize: 18,
              margin: "0 0 4px",
              color: "#2B2620",
            }}
          >
            What if?
          </h3>
          <p style={{ fontSize: 14, fontWeight: 500, color: "#6A6155", margin: "0 0 16px", lineHeight: 1.5 }}>
            Slide to pick an amount. See how your money could move.
          </p>

          <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 12 }}>
            <span style={{ fontFamily: "var(--font-quicksand), sans-serif", fontWeight: 700, fontSize: 32, color: "var(--accent, #4F9D69)", lineHeight: 1 }}>
              {`₹${fmt(amount)}`}
            </span>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#A89E8B" }}>to try</span>
          </div>
          <input
            type="range"
            min={100}
            max={5000}
            step={100}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            style={{ width: "100%", accentColor: "var(--accent, #4F9D69)", height: 6, cursor: "pointer" }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 700, color: "#B3A998", marginTop: 4, marginBottom: 18 }}>
            <span>₹100</span>
            <span>₹5,000</span>
          </div>

          {shares >= 1 ? (
            <>
              <div style={{ padding: "10px 14px", background: "#F4F0E7", borderRadius: 12, marginBottom: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#6A6155" }}>
                  {`${shares} ${shares === 1 ? "share" : "shares"} · ₹${fmt(Math.round(invested))} invested`}
                </span>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#A89E8B" }}>today</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {SCENARIOS.map((s) => {
                  const endValue = invested * (1 + s.change);
                  const diff = endValue - invested;
                  const barW = `${(Math.abs(s.change) / 0.30) * 100}%`;
                  return (
                    <div
                      key={s.label}
                      style={{
                        padding: "12px 14px",
                        borderRadius: 14,
                        background: s.bg,
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                      }}
                    >
                      <div style={{ width: 80, flexShrink: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: s.gainColor }}>
                          {s.label}
                        </div>
                        <div style={{ height: 4, background: "rgba(0,0,0,.08)", borderRadius: 999, marginTop: 5, overflow: "hidden" }}>
                          <div style={{ height: "100%", width: barW, background: s.barColor, borderRadius: 999 }} />
                        </div>
                      </div>
                      <div style={{ flex: 1, textAlign: "right" }}>
                        <span style={{ fontFamily: "var(--font-quicksand), sans-serif", fontWeight: 700, fontSize: 18, color: s.gainColor }}>
                          {`₹${fmt(Math.round(endValue))}`}
                        </span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: s.gainColor, marginLeft: 8 }}>
                          {`${s.change > 0 ? "+" : ""}₹${fmt(Math.round(Math.abs(diff)))}`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <p style={{ fontSize: 12, fontWeight: 700, color: "#B3A998", marginTop: 10, textAlign: "center" }}>
                This is illustrative only — stocks can move in ways no one predicts.
              </p>
            </>
          ) : (
            <div style={{ padding: "14px 16px", background: "#FBF1DC", borderRadius: 14, fontSize: 14.5, fontWeight: 600, color: "#9A7320", lineHeight: 1.5 }}>
              {`One share of ${name} costs ₹${fmt(Math.round(price))} — nudge the slider up to see the scenarios.`}
            </div>
          )}
        </div>
      )}

      {/* Year range bar (from live data) */}
      {week52High !== null && week52Low !== null && price !== null && (
        <div style={cardStyle}>
          <YearRangeBar low={week52Low} high={week52High} current={price} />
        </div>
      )}

      {/* Price history chart */}
      {symbol && (
        <div style={cardStyle}>
          <PriceChart symbol={symbol} />
        </div>
      )}

      {/* CTA row */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 8 }}>
        <button
          onClick={() => onGoTrade(symbol, name)}
          style={{
            fontFamily: "var(--font-quicksand), sans-serif",
            fontWeight: 700,
            fontSize: 16,
            color: "#fff",
            background: "var(--accent, #4F9D69)",
            border: "none",
            cursor: "pointer",
            padding: "15px 28px",
            borderRadius: 999,
            boxShadow: "0 12px 26px color-mix(in srgb, var(--accent, #4F9D69) 36%, transparent)",
          }}
        >
          Practice buy &nbsp;→
        </button>
        <button
          onClick={onBack}
          style={{
            fontFamily: "var(--font-quicksand), sans-serif",
            fontWeight: 700,
            fontSize: 16,
            color: "#6A6155",
            background: "#F1ECE1",
            border: "none",
            cursor: "pointer",
            padding: "15px 24px",
            borderRadius: 999,
          }}
        >
          Back to Explore
        </button>
      </div>

      <p style={{ fontSize: 13, fontWeight: 600, color: "#A89E8B", marginTop: 18, lineHeight: 1.5 }}>
        🙂 None of this is financial advice. Nudge helps you understand investing — always do your own research.
      </p>
    </main>
  );
}
