"use client";

import { useEffect, useState } from "react";
import { getLearnedConcepts, CONCEPTS, type ConceptId } from "@/lib/learned";

export default function LearnedPanel() {
  const [learned, setLearned] = useState<ConceptId[]>([]);

  useEffect(() => {
    // Read after mount so SSR and client are in sync
    Promise.resolve().then(() => {
      setLearned(getLearnedConcepts());
    });
  }, []);

  if (learned.length === 0) return null;

  return (
    <div
      style={{
        marginTop: 28,
        padding: "20px 22px",
        background: "color-mix(in srgb, var(--accent, #4F9D69) 7%, #FFFDF9)",
        border: "1px solid color-mix(in srgb, var(--accent, #4F9D69) 18%, transparent)",
        borderRadius: "var(--radius, 24px)",
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-quicksand), sans-serif",
          fontWeight: 700,
          fontSize: 13.5,
          color: "color-mix(in srgb, var(--accent, #4F9D69) 70%, #2B2620)",
          marginBottom: 12,
        }}
      >
        you now understand:
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {learned.map((id) => (
          <span
            key={id}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              padding: "6px 12px",
              borderRadius: 999,
              background: "#fff",
              border: "1px solid color-mix(in srgb, var(--accent, #4F9D69) 28%, transparent)",
              fontSize: 13,
              fontWeight: 700,
              color: "#4A4339",
            }}
          >
            <span style={{ fontSize: 11, color: "var(--accent, #4F9D69)" }}>✓</span>
            {CONCEPTS[id].label}
          </span>
        ))}
      </div>
      <p
        style={{
          margin: "12px 0 0",
          fontSize: 12.5,
          fontWeight: 600,
          color: "#A89E8B",
          lineHeight: 1.5,
        }}
      >
        these show up automatically each time you tap or hover a new term.
      </p>
    </div>
  );
}
