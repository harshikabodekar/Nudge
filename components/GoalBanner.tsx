"use client";

import { fmt } from "@/lib/nudge-data";
import type { Goal } from "@/lib/goals";

export default function GoalBanner({ goal, onChangeGoal }: { goal: Goal; onChangeGoal: () => void }) {
  return (
    <button
      onClick={onChangeGoal}
      style={{
        display: "flex",
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
        flexWrap: "wrap",
        minHeight: 44,
        gap: 8,
        background: "color-mix(in srgb, var(--accent, #4F9D69) 9%, #FFFDF9)",
        borderWidth: "0 0 1px 0",
        borderStyle: "solid",
        borderColor: "rgba(120,105,80,.1)",
        cursor: "pointer",
        padding: "10px 16px",
        fontFamily: "var(--font-nunito), sans-serif",
        textAlign: "center",
      }}
    >
      <span
        style={{
          fontWeight: 700,
          fontSize: 13.5,
          color: "color-mix(in srgb, var(--accent, #4F9D69) 78%, #2E2922)",
          minWidth: 0,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          flexShrink: 1,
        }}
      >
        {`🎯 ${goal.label} · ₹${fmt(goal.targetAmount)}`}
      </span>
      <span
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: "#A89E8B",
          textDecoration: "underline",
          textUnderlineOffset: 2,
          flexShrink: 0,
        }}
      >
        manage goals
      </span>
    </button>
  );
}
