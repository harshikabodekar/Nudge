"use client";

import { fmt } from "@/lib/nudge-data";
import type { Goal } from "@/lib/goal";

export default function GoalProgress({ goal, totalValue }: { goal: Goal; totalValue: number }) {
  const pct = Math.min(100, Math.max(0, (totalValue / goal.targetAmount) * 100));
  const reached = totalValue >= goal.targetAmount;

  return (
    <div
      style={{
        background: "#FFFDF9",
        border: "1px solid rgba(120,105,80,.12)",
        borderRadius: "calc(var(--radius, 24px) + 8px)",
        padding: "clamp(20px, 4vw, 26px)",
        boxShadow: "0 18px 50px -34px rgba(80,65,40,.4)",
        marginBottom: 18,
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10, marginBottom: 12 }}>
        <h3
          style={{
            fontFamily: "var(--font-quicksand), sans-serif",
            fontWeight: 700,
            fontSize: 17,
            margin: 0,
            color: "#2B2620",
          }}
        >
          Toward your goal
        </h3>
        <span style={{ fontSize: 13, fontWeight: 700, color: "#A89E8B" }}>{goal.label}</span>
      </div>

      <div
        style={{
          height: 10,
          borderRadius: 999,
          background: "#F1ECE1",
          overflow: "hidden",
          marginBottom: 12,
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            borderRadius: 999,
            background: reached ? "#4F9D69" : "var(--accent, #4F9D69)",
            transition: "width .3s ease",
          }}
        />
      </div>

      <p style={{ margin: 0, fontSize: 15.5, lineHeight: 1.5, fontWeight: 600, color: "#4A4339" }}>
        {reached
          ? `you've reached your ${goal.label} goal — ₹${fmt(Math.round(totalValue))} saved toward ₹${fmt(goal.targetAmount)} 🎉`
          : `you're ₹${fmt(Math.round(totalValue))} of the way to ₹${fmt(goal.targetAmount)} — ${Math.round(pct)}%`}
      </p>

      {goal.timeframeMonths && !reached && (
        <p style={{ margin: "8px 0 0", fontSize: 13, fontWeight: 600, color: "#A89E8B", lineHeight: 1.5 }}>
          {`you gave yourself about ${goal.timeframeMonths} ${goal.timeframeMonths === 1 ? "month" : "months"} for this — just a marker, no pressure.`}
        </p>
      )}
    </div>
  );
}
