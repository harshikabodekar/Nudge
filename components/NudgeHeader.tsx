"use client";

import type { Screen } from "@/lib/nudge-types";

const NAV_ITEMS: { key: Screen; label: string }[] = [
  { key: "home", label: "Home" },
  { key: "explore", label: "Explore" },
  { key: "about", label: "About" },
  { key: "trade", label: "Trade" },
];

export default function NudgeHeader({
  screen,
  onNavigate,
}: {
  screen: Screen;
  onNavigate: (screen: Screen) => void;
}) {
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        backdropFilter: "blur(10px)",
        background: "color-mix(in srgb, #F4EEE3 78%, transparent)",
        borderBottom: "1px solid rgba(120,105,80,.10)",
      }}
    >
      <nav
        style={{
          maxWidth: 1080,
          margin: "0 auto",
          padding: "16px 22px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        <button
          onClick={() => onNavigate("home")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
            fontFamily: "var(--font-quicksand), sans-serif",
          }}
        >
          <span
            style={{
              width: 34,
              height: 34,
              borderRadius: 12,
              background: "var(--accent, #4F9D69)",
              display: "grid",
              placeItems: "center",
              color: "#fff",
              fontWeight: 700,
              fontSize: 19,
              boxShadow:
                "0 6px 16px color-mix(in srgb, var(--accent, #4F9D69) 35%, transparent)",
            }}
          >
            n
          </span>
          <span
            className="nudge-wordmark"
            style={{
              fontWeight: 700,
              fontSize: 22,
              letterSpacing: "-.3px",
              color: "#2E2922",
            }}
          >
            Nudge
          </span>
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {NAV_ITEMS.map((item) => {
            const active = screen === item.key;
            return (
              <button
                key={item.key}
                onClick={() => onNavigate(item.key)}
                className="nudge-nav-btn"
                style={{
                  background: active
                    ? "color-mix(in srgb, var(--accent, #4F9D69) 16%, #fff)"
                    : "transparent",
                  color: active
                    ? "color-mix(in srgb, var(--accent, #4F9D69) 82%, #2E2922)"
                    : "#7A715F",
                }}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
