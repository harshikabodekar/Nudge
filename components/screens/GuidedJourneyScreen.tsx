"use client";

import { useState } from "react";
import { companies, fmt } from "@/lib/nudge-data";
import { useLiveStock } from "@/lib/useLiveStock";
import { markFirstTradeComplete } from "@/lib/firstTrade";
import type { Goal } from "@/lib/goal";

// Always uses the first preset (Zomato/Eternal) for the guided journey —
// richest static narrative and most recognisable name for first-timers.
const GUIDED_COMPANY = companies[0];
const GUIDED_AMOUNT = 500;

type Step = 0 | 1 | 2 | 3;

export default function GuidedJourneyScreen({
  goal,
  onSkip,
  onComplete,
  onBuy,
}: {
  goal: Goal;
  onSkip: () => void;
  onComplete: () => void;
  onBuy: (symbol: string, name: string, quantity: number, price: number) => boolean;
}) {
  const [step, setStep] = useState<Step>(0);
  const [bought, setBought] = useState<{ shares: number; price: number } | null>(null);
  const live = useLiveStock(GUIDED_COMPANY.symbol);
  const price = live.data?.price ?? GUIDED_COMPANY.price;
  const shares = Math.floor(GUIDED_AMOUNT / price);
  const invested = shares * price;

  const handlePracticeBuy = () => {
    if (shares < 1) return;
    onBuy(GUIDED_COMPANY.symbol, GUIDED_COMPANY.name, shares, price);
    markFirstTradeComplete();
    setBought({ shares, price });
    setStep(3);
  };

  const advance = () => setStep((s) => Math.min(s + 1, 2) as Step);

  return (
    <main
      style={{
        maxWidth: 580,
        margin: "0 auto",
        padding: "clamp(40px, 8vw, 88px) 22px 80px",
      }}
    >
      {/* Nudge avatar header */}
      <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 22, animation: "nudgeRise .5s ease both" }}>
        <span
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: "var(--accent, #4F9D69)",
            display: "grid",
            placeItems: "center",
            color: "#fff",
            fontWeight: 700,
            fontFamily: "var(--font-quicksand), sans-serif",
            fontSize: 20,
            flexShrink: 0,
          }}
        >
          n
        </span>
        <div>
          <div style={{ fontFamily: "var(--font-quicksand), sans-serif", fontWeight: 700, fontSize: 16, color: "#2E2922" }}>
            Nudge
          </div>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--accent, #4F9D69)", display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--accent, #4F9D69)" }} />
            online · here to help
          </div>
        </div>
      </div>

      {/* Main card */}
      <div
        style={{
          background: "#FFFDF9",
          border: "1px solid rgba(120,105,80,.12)",
          borderRadius: "calc(var(--radius, 24px) + 6px)",
          padding: "clamp(24px, 4vw, 32px)",
          boxShadow: "0 24px 60px -34px rgba(80,65,40,.45)",
          animation: "nudgeRise .6s ease .1s both",
          position: "relative",
        }}
      >
        {/* Skip link — hidden on the done screen */}
        {step < 3 && (
          <button
            onClick={onSkip}
            style={{
              position: "absolute",
              top: 20,
              right: 22,
              fontFamily: "var(--font-nunito), sans-serif",
              fontWeight: 700,
              fontSize: 13,
              color: "#A89E8B",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              textDecoration: "underline",
              textUnderlineOffset: 3,
            }}
          >
            Skip →
          </button>
        )}

        {/* ── Step 0: Understand the company ── */}
        {step === 0 && (
          <div style={{ animation: "bubbleIn .35s ease both" }}>
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
            >
              Step 1 of 3
            </div>
            <h2
              style={{
                fontFamily: "var(--font-quicksand), sans-serif",
                fontWeight: 700,
                fontSize: "clamp(22px, 3.5vw, 28px)",
                letterSpacing: "-.4px",
                margin: "0 0 6px",
                color: "#2B2620",
                paddingRight: 48,
              }}
            >
              Let&apos;s look at one company together
            </h2>
            <p style={{ fontSize: 15.5, fontWeight: 500, color: "#5C544A", margin: "0 0 20px", lineHeight: 1.5 }}>
              {`You said you're saving toward ${goal.label}. To get there, you need to understand how investing works — and the best way to learn is to just try it.`}
            </p>

            {/* Mini company card */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "16px",
                background: "#FBF7EF",
                borderRadius: 18,
                border: "1px solid rgba(120,105,80,.14)",
                marginBottom: 20,
              }}
            >
              <span
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 14,
                  background: GUIDED_COMPANY.logoBg,
                  color: GUIDED_COMPANY.logoColor,
                  display: "grid",
                  placeItems: "center",
                  fontFamily: "var(--font-quicksand), sans-serif",
                  fontWeight: 700,
                  fontSize: 22,
                  flexShrink: 0,
                }}
              >
                {GUIDED_COMPANY.logo}
              </span>
              <div>
                <div style={{ fontFamily: "var(--font-quicksand), sans-serif", fontWeight: 700, fontSize: 18, color: "#2B2620" }}>
                  {GUIDED_COMPANY.name}
                </div>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: "#9A907E" }}>
                  {GUIDED_COMPANY.sector}
                </div>
              </div>
            </div>

            <p style={{ fontSize: 15.5, fontWeight: 500, color: "#4A4339", lineHeight: 1.6, margin: "0 0 24px" }}>
              {GUIDED_COMPANY.rows[0]?.text ?? `${GUIDED_COMPANY.name} is one of India's most recognisable brands — a good first company to understand.`}
            </p>

            <button
              onClick={advance}
              style={{
                width: "100%",
                fontFamily: "var(--font-quicksand), sans-serif",
                fontWeight: 700,
                fontSize: 16,
                color: "#fff",
                background: "var(--accent, #4F9D69)",
                border: "none",
                cursor: "pointer",
                padding: "15px 24px",
                borderRadius: 999,
                boxShadow: "0 12px 26px color-mix(in srgb, var(--accent, #4F9D69) 38%, transparent)",
              }}
            >
              Got it — what would ₹500 do? →
            </button>
          </div>
        )}

        {/* ── Step 1: See what ₹500 does ── */}
        {step === 1 && (
          <div style={{ animation: "bubbleIn .35s ease both" }}>
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
            >
              Step 2 of 3
            </div>
            <h2
              style={{
                fontFamily: "var(--font-quicksand), sans-serif",
                fontWeight: 700,
                fontSize: "clamp(22px, 3.5vw, 28px)",
                letterSpacing: "-.4px",
                margin: "0 0 6px",
                color: "#2B2620",
                paddingRight: 48,
              }}
            >
              See what ₹500 actually gets you
            </h2>
            <p style={{ fontSize: 15.5, fontWeight: 500, color: "#5C544A", margin: "0 0 20px", lineHeight: 1.5 }}>
              {`One share of ${GUIDED_COMPANY.name} costs ₹${fmt(Math.round(price))} right now. ₹500 is enough to buy ${shares > 0 ? shares : "a"} ${shares === 1 ? "share" : "shares"}.`}
            </p>

            {shares >= 1 ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 20 }}>
                <div style={{ padding: "14px 10px", borderRadius: 16, background: "#F4F0E7", textAlign: "center" }}>
                  <div style={{ fontFamily: "var(--font-quicksand), sans-serif", fontWeight: 700, fontSize: 28, color: "#2B2620" }}>
                    {shares}
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#8A8072" }}>
                    {shares === 1 ? "share" : "shares"} you&apos;d own
                  </div>
                </div>
                <div style={{ padding: "14px 10px", borderRadius: 16, background: "#E9F4EC", textAlign: "center" }}>
                  <div style={{ fontFamily: "var(--font-quicksand), sans-serif", fontWeight: 700, fontSize: 19, color: "#36774A" }}>
                    {`₹${fmt(Math.round(invested * 1.1))}`}
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#5C9A6E" }}>if it rises 10%</div>
                </div>
                <div style={{ padding: "14px 10px", borderRadius: 16, background: "#FBECE4", textAlign: "center" }}>
                  <div style={{ fontFamily: "var(--font-quicksand), sans-serif", fontWeight: 700, fontSize: 19, color: "#A8512F" }}>
                    {`₹${fmt(Math.round(invested * 0.9))}`}
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#C07A5A" }}>if it dips 10%</div>
                </div>
              </div>
            ) : (
              <div style={{ padding: "14px 16px", background: "#FBF1DC", borderRadius: 16, marginBottom: 20, fontSize: 15, fontWeight: 600, color: "#9A7320", lineHeight: 1.5 }}>
                {`The live price (₹${fmt(Math.round(price))}) is a little above ₹500 right now — no worries, the numbers still work the same way in the simulator.`}
              </div>
            )}

            <p style={{ fontSize: 13, fontWeight: 600, color: "#A89E8B", margin: "0 0 22px" }}>
              prices move every day — this is just to get a feel for it 🙂
            </p>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setStep(0)}
                style={{
                  fontFamily: "var(--font-quicksand), sans-serif",
                  fontWeight: 700,
                  fontSize: 15,
                  color: "#6A6155",
                  background: "#F1ECE1",
                  border: "none",
                  cursor: "pointer",
                  padding: "14px 20px",
                  borderRadius: 999,
                }}
              >
                ← Back
              </button>
              <button
                onClick={advance}
                style={{
                  flex: 1,
                  fontFamily: "var(--font-quicksand), sans-serif",
                  fontWeight: 700,
                  fontSize: 16,
                  color: "#fff",
                  background: "var(--accent, #4F9D69)",
                  border: "none",
                  cursor: "pointer",
                  padding: "14px 24px",
                  borderRadius: 999,
                  boxShadow: "0 12px 26px color-mix(in srgb, var(--accent, #4F9D69) 38%, transparent)",
                }}
              >
                Make a practice buy →
              </button>
            </div>
          </div>
        )}

        {/* ── Step 2: Practice buy ── */}
        {step === 2 && (
          <div style={{ animation: "bubbleIn .35s ease both" }}>
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
            >
              Step 3 of 3
            </div>
            <h2
              style={{
                fontFamily: "var(--font-quicksand), sans-serif",
                fontWeight: 700,
                fontSize: "clamp(22px, 3.5vw, 28px)",
                letterSpacing: "-.4px",
                margin: "0 0 6px",
                color: "#2B2620",
                paddingRight: 48,
              }}
            >
              Your first practice buy
            </h2>
            <p style={{ fontSize: 15.5, fontWeight: 500, color: "#5C544A", margin: "0 0 20px", lineHeight: 1.5 }}>
              This is practice money — ₹10,000 of fake cash. Nothing real leaves your pocket, ever. Tap confirm and watch what happens.
            </p>

            <div
              style={{
                padding: "18px",
                background: "color-mix(in srgb, var(--accent, #4F9D69) 9%, #fff)",
                border: "1px solid color-mix(in srgb, var(--accent, #4F9D69) 22%, transparent)",
                borderRadius: 18,
                marginBottom: 22,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
                <span style={{ fontSize: 13.5, fontWeight: 700, color: "#6A6155" }}>Order summary</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#A89E8B" }}>practice · not real</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
                <div>
                  <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: ".4px", textTransform: "uppercase", color: "#A89E8B" }}>Company</div>
                  <div style={{ fontFamily: "var(--font-quicksand), sans-serif", fontWeight: 700, fontSize: 16, color: "#2B2620" }}>{GUIDED_COMPANY.name}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: ".4px", textTransform: "uppercase", color: "#A89E8B" }}>Shares</div>
                  <div style={{ fontFamily: "var(--font-quicksand), sans-serif", fontWeight: 700, fontSize: 16, color: "#2B2620" }}>{shares > 0 ? shares : "—"}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: ".4px", textTransform: "uppercase", color: "#A89E8B" }}>Price per share</div>
                  <div style={{ fontFamily: "var(--font-quicksand), sans-serif", fontWeight: 700, fontSize: 16, color: "#2B2620" }}>{`₹${fmt(Math.round(price))}`}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: ".4px", textTransform: "uppercase", color: "#A89E8B" }}>Total</div>
                  <div style={{ fontFamily: "var(--font-quicksand), sans-serif", fontWeight: 700, fontSize: 16, color: "#2B2620" }}>{shares > 0 ? `₹${fmt(Math.round(invested))}` : "—"}</div>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setStep(1)}
                style={{
                  fontFamily: "var(--font-quicksand), sans-serif",
                  fontWeight: 700,
                  fontSize: 15,
                  color: "#6A6155",
                  background: "#F1ECE1",
                  border: "none",
                  cursor: "pointer",
                  padding: "14px 20px",
                  borderRadius: 999,
                }}
              >
                ← Back
              </button>
              {shares >= 1 ? (
                <button
                  onClick={handlePracticeBuy}
                  style={{
                    flex: 1,
                    fontFamily: "var(--font-quicksand), sans-serif",
                    fontWeight: 700,
                    fontSize: 16,
                    color: "#fff",
                    background: "var(--accent, #4F9D69)",
                    border: "none",
                    cursor: "pointer",
                    padding: "14px 24px",
                    borderRadius: 999,
                    boxShadow: "0 12px 26px color-mix(in srgb, var(--accent, #4F9D69) 38%, transparent)",
                  }}
                >
                  ✓ Confirm practice buy
                </button>
              ) : (
                <div style={{ flex: 1, padding: "14px 16px", background: "#FBF1DC", borderRadius: 999, fontSize: 14, fontWeight: 700, color: "#9A7320", textAlign: "center" }}>
                  {`Price too high for ₹500 right now — skip to explore on your own`}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Step 3: Celebration ── */}
        {step === 3 && (
          <div style={{ textAlign: "center", animation: "bubbleIn .35s ease both" }}>
            <div style={{ fontSize: 52, lineHeight: 1, marginBottom: 14 }}>🎉</div>
            <h2
              style={{
                fontFamily: "var(--font-quicksand), sans-serif",
                fontWeight: 700,
                fontSize: "clamp(22px, 3.5vw, 28px)",
                letterSpacing: "-.4px",
                margin: "0 0 10px",
                color: "#2B2620",
              }}
            >
              You just did your first trade!
            </h2>
            <p style={{ fontSize: 16, fontWeight: 500, color: "#5C544A", margin: "0 auto 20px", maxWidth: 380, lineHeight: 1.55 }}>
              {bought
                ? `You practice-bought ${bought.shares} ${bought.shares === 1 ? "share" : "shares"} of ${GUIDED_COMPANY.name} at ₹${fmt(Math.round(bought.price))} each. It's in your wallet now.`
                : `Your practice buy went through. It's in your wallet now.`}
            </p>

            <div
              style={{
                padding: "14px 18px",
                background: "color-mix(in srgb, var(--accent, #4F9D69) 10%, #fff)",
                borderRadius: 16,
                border: "1px solid color-mix(in srgb, var(--accent, #4F9D69) 22%, transparent)",
                fontSize: 15,
                fontWeight: 600,
                color: "#4A7A5C",
                lineHeight: 1.5,
                marginBottom: 24,
                textAlign: "left",
              }}
            >
              {`This is exactly what a real trade feels like — you picked a company, saw the numbers, and committed. The only difference is it costs nothing here.`}
            </div>

            <button
              onClick={onComplete}
              style={{
                width: "100%",
                fontFamily: "var(--font-quicksand), sans-serif",
                fontWeight: 700,
                fontSize: 17,
                color: "#fff",
                background: "var(--accent, #4F9D69)",
                border: "none",
                cursor: "pointer",
                padding: "16px 24px",
                borderRadius: 999,
                boxShadow: "0 12px 26px color-mix(in srgb, var(--accent, #4F9D69) 38%, transparent)",
              }}
            >
              Keep exploring →
            </button>
          </div>
        )}
      </div>

      {/* Progress dots */}
      {step < 3 && (
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 22 }}>
          {([0, 1, 2] as Step[]).map((s) => (
            <span
              key={s}
              style={{
                width: s === step ? 22 : 8,
                height: 8,
                borderRadius: 999,
                background: s === step ? "var(--accent, #4F9D69)" : "rgba(120,105,80,.22)",
                transition: "all .25s ease",
              }}
            />
          ))}
        </div>
      )}
    </main>
  );
}
