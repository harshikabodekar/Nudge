"use client";

import type { Stat } from "@/lib/nudge-data";
import ExplainerPanel from "@/components/ExplainerPanel";

export default function TappableTerms({
  terms,
  activeKey,
  onToggle,
}: {
  terms: Stat[];
  activeKey: string | null;
  onToggle: (key: string) => void;
}) {
  const active = terms.find((t) => t.key === activeKey) ?? null;

  return (
    <>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(118px, 1fr))",
          gap: 10,
        }}
      >
        {terms.map((term) => {
          const isActive = activeKey === term.key;
          return (
            <button
              key={term.key}
              onClick={() => onToggle(term.key)}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 3,
                alignItems: "flex-start",
                textAlign: "left",
                cursor: "pointer",
                padding: "13px 15px",
                borderRadius: 16,
                fontFamily: "var(--font-nunito), sans-serif",
                transition: "all .16s ease",
                background: isActive
                  ? "color-mix(in srgb, var(--accent, #4F9D69) 13%, #fff)"
                  : "#FBF7EF",
                border: `1.5px solid ${
                  isActive
                    ? "color-mix(in srgb, var(--accent, #4F9D69) 48%, transparent)"
                    : "rgba(120,105,80,.16)"
                }`,
              }}
            >
              <span
                style={{
                  fontSize: 11.5,
                  fontWeight: 700,
                  letterSpacing: ".4px",
                  textTransform: "uppercase",
                  color: "#A89E8B",
                }}
              >
                {term.label}
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
            </button>
          );
        })}
      </div>
      {active && <ExplainerPanel label={active.label} explain={active.explain} />}
    </>
  );
}
