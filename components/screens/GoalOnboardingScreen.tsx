"use client";

import { useState } from "react";
import { saveGoal, type Goal } from "@/lib/goal";

const inputStyle: React.CSSProperties = {
  width: "100%",
  fontFamily: "var(--font-nunito), sans-serif",
  fontWeight: 600,
  fontSize: 17,
  color: "#36302A",
  background: "#FBF7EF",
  border: "1.5px solid rgba(120,105,80,.16)",
  borderRadius: 14,
  padding: "13px 16px",
  outline: "none",
};

const fieldLabelStyle: React.CSSProperties = {
  display: "block",
  fontFamily: "var(--font-quicksand), sans-serif",
  fontWeight: 700,
  fontSize: 16,
  color: "#2B2620",
  marginBottom: 8,
};

export default function GoalOnboardingScreen({ onComplete }: { onComplete: (goal: Goal) => void }) {
  const [label, setLabel] = useState("");
  const [amount, setAmount] = useState("");
  const [timeframe, setTimeframe] = useState("");

  const trimmedLabel = label.trim();
  const amountNum = Number(amount);
  const hasValidAmount = amount.trim() !== "" && Number.isFinite(amountNum) && amountNum > 0;
  const timeframeNum = timeframe.trim() ? Number(timeframe) : undefined;
  const hasValidTimeframe =
    timeframeNum === undefined || (Number.isFinite(timeframeNum) && timeframeNum > 0);

  const canConfirm = trimmedLabel.length > 0 && hasValidAmount && hasValidTimeframe;

  const handleConfirm = () => {
    if (!canConfirm) return;
    const goal: Goal = {
      label: trimmedLabel,
      targetAmount: amountNum,
      ...(timeframeNum !== undefined ? { timeframeMonths: timeframeNum } : {}),
      createdAt: Date.now(),
    };
    saveGoal(goal);
    onComplete(goal);
  };

  return (
    <main
      style={{
        maxWidth: 560,
        margin: "0 auto",
        padding: "clamp(40px, 8vw, 88px) 22px 80px",
      }}
    >
      <div style={{ animation: "nudgeRise .5s ease both", marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 22 }}>
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
            }}
          >
            n
          </span>
          <div>
            <div
              style={{
                fontFamily: "var(--font-quicksand), sans-serif",
                fontWeight: 700,
                fontSize: 16,
                color: "#2E2922",
              }}
            >
              Nudge
            </div>
            <div
              style={{
                fontSize: 12.5,
                fontWeight: 700,
                color: "var(--accent, #4F9D69)",
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--accent, #4F9D69)" }} />
              online · here to help
            </div>
          </div>
        </div>

        <div
          style={{
            alignSelf: "flex-start",
            maxWidth: "92%",
            background: "color-mix(in srgb, var(--accent, #4F9D69) 16%, #fff)",
            color: "color-mix(in srgb, var(--accent, #4F9D69) 82%, #2E2922)",
            padding: "13px 17px",
            borderRadius: 20,
            borderBottomLeftRadius: 7,
            fontSize: 16,
            lineHeight: 1.5,
            fontWeight: 500,
            boxShadow: "0 2px 8px -4px rgba(80,65,40,.18)",
            animation: "bubbleIn .4s ease both",
          }}
        >
          hey, before we look at any companies — what are you actually saving
          toward? 👋
        </div>
      </div>

      <div
        style={{
          background: "#FFFDF9",
          border: "1px solid rgba(120,105,80,.12)",
          borderRadius: "calc(var(--radius, 24px) + 6px)",
          padding: "clamp(24px, 4vw, 32px)",
          boxShadow: "0 24px 60px -34px rgba(80,65,40,.45)",
          animation: "nudgeRise .6s ease .1s both",
        }}
      >
        <div style={{ marginBottom: 24 }}>
          <label style={fieldLabelStyle}>What are you saving toward?</label>
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Goa trip, new phone, emergency fund..."
            style={inputStyle}
          />
          <p style={{ margin: "7px 0 0", fontSize: 13, fontWeight: 600, color: "#A89E8B" }}>
            in your own words — whatever it actually is.
          </p>
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={fieldLabelStyle}>How much do you need?</label>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span
              style={{
                fontFamily: "var(--font-quicksand), sans-serif",
                fontWeight: 700,
                fontSize: 18,
                color: "#9A907E",
              }}
            >
              ₹
            </span>
            <input
              type="number"
              min={1}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="25,000"
              style={inputStyle}
            />
          </div>
        </div>

        <div style={{ marginBottom: 30 }}>
          <label style={fieldLabelStyle}>By when?</label>
          <input
            type="number"
            min={1}
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            placeholder="e.g. 6 months — or leave blank"
            style={inputStyle}
          />
          <p style={{ margin: "7px 0 0", fontSize: 13, fontWeight: 600, color: "#A89E8B" }}>
            optional — skip it if you&apos;re not sure yet.
          </p>
        </div>

        <button
          onClick={handleConfirm}
          disabled={!canConfirm}
          style={{
            width: "100%",
            fontFamily: "var(--font-quicksand), sans-serif",
            fontWeight: 700,
            fontSize: 17,
            color: "#fff",
            background: canConfirm ? "var(--accent, #4F9D69)" : "#C3B9A6",
            border: "none",
            cursor: canConfirm ? "pointer" : "not-allowed",
            padding: "16px 24px",
            borderRadius: 999,
            boxShadow: canConfirm
              ? "0 12px 26px color-mix(in srgb, var(--accent, #4F9D69) 38%, transparent)"
              : "none",
          }}
        >
          That&apos;s my goal &nbsp;→
        </button>
        <p style={{ margin: "12px 0 0", textAlign: "center", fontSize: 13, fontWeight: 600, color: "#A89E8B" }}>
          we just need a goal and an amount to get going.
        </p>
      </div>
    </main>
  );
}
