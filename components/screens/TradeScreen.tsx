"use client";

import { companies, fmt, vibeColors } from "@/lib/nudge-data";
import type { Wallet } from "@/lib/wallet";

// Trade screen doesn't fetch live prices (yet) — use the matching preset's
// static reference price if the holding is one of the 3 presets, else fall
// back to the holding's own average cost (flat P/L) so a non-preset holding
// (from search) still displays safely instead of crashing.
function currentPriceFor(symbol: string, avgPrice: number): number {
  return companies.find((c) => c.symbol === symbol)?.price ?? avgPrice;
}

export default function TradeScreen({
  wallet,
  onReset,
  onExplore,
}: {
  wallet: Wallet;
  onReset: () => void;
  onExplore: () => void;
}) {
  const holdings = Object.values(wallet.holdings).map((h) => {
    const company = companies.find((c) => c.symbol === h.symbol);
    const nowPrice = currentPriceFor(h.symbol, h.avgPrice);
    const value = h.quantity * nowPrice;
    const pl = value - h.invested;
    const pc = vibeColors(pl > 1 ? "green" : pl < -1 ? "red" : "yellow");
    const initial = h.name.trim().charAt(0).toUpperCase() || "?";
    return {
      key: h.symbol,
      name: h.name,
      logo: company?.logo ?? initial,
      logoBg: company?.logoBg ?? "#EDE7DA",
      logoColor: company?.logoColor ?? "#6A6155",
      sharesLabel: `${h.quantity} ${h.quantity === 1 ? "share" : "shares"}`,
      avgLabel: `₹${fmt(Math.round(h.avgPrice))}`,
      nowLabel: `₹${fmt(Math.round(nowPrice))}`,
      valueLabel: `₹${fmt(Math.round(value))}`,
      plLabel: `${pl >= 0 ? "▲ +₹" : "▼ ₹"}${fmt(Math.abs(Math.round(pl)))} on paper`,
      plBg: pc.bg,
      plText: pc.text,
    };
  });

  const investedValue = Object.values(wallet.holdings).reduce(
    (a, h) => a + h.quantity * currentPriceFor(h.symbol, h.avgPrice),
    0
  );
  const total = wallet.cash + investedValue;
  const totalPL = total - 10000;
  const totalPLLabel = `${totalPL >= 0 ? "▲ +₹" : "▼ ₹"}${fmt(
    Math.abs(Math.round(totalPL))
  )} since you started`;

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
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 14,
          }}
        >
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
              In stocks
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
        {totalPL > 1 && (
          <div
            style={{
              marginTop: 16,
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
              marginTop: 16,
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
              marginTop: 16,
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
      </div>

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
      {holdings.length > 0 ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
            marginBottom: 28,
          }}
        >
          {holdings.map((h) => (
            <div
              key={h.key}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: 16,
                background: "#FFFDF9",
                border: "1px solid rgba(120,105,80,.12)",
                borderRadius: 20,
                boxShadow: "0 12px 34px -30px rgba(80,65,40,.45)",
                flexWrap: "wrap",
              }}
            >
              <span
                style={{
                  flex: "none",
                  width: 46,
                  height: 46,
                  borderRadius: 14,
                  background: h.logoBg,
                  color: h.logoColor,
                  display: "grid",
                  placeItems: "center",
                  fontFamily: "var(--font-quicksand), sans-serif",
                  fontWeight: 700,
                  fontSize: 21,
                }}
              >
                {h.logo}
              </span>
              <div style={{ flex: 1, minWidth: 130 }}>
                <div
                  style={{
                    fontFamily: "var(--font-quicksand), sans-serif",
                    fontWeight: 700,
                    fontSize: 17,
                    color: "#2B2620",
                  }}
                >
                  {h.name}
                </div>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: "#9A907E" }}>{`${h.sharesLabel} · paid ~${h.avgLabel} → now ${h.nowLabel}`}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div
                  style={{
                    fontFamily: "var(--font-quicksand), sans-serif",
                    fontWeight: 700,
                    fontSize: 18,
                    color: "#2B2620",
                    marginBottom: 4,
                  }}
                >
                  {h.valueLabel}
                </div>
                <div
                  style={{
                    display: "inline-flex",
                    padding: "5px 11px",
                    borderRadius: 999,
                    background: h.plBg,
                    color: h.plText,
                    fontWeight: 700,
                    fontSize: 12.5,
                  }}
                >
                  {h.plLabel}
                </div>
              </div>
            </div>
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
          <p
            style={{
              fontSize: 16.5,
              fontWeight: 600,
              color: "#6A6155",
              margin: "0 0 18px",
              lineHeight: 1.5,
            }}
          >
            No practice trades yet.
            <br />
            Pick a company and try your very first buy.
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
              boxShadow:
                "0 12px 26px color-mix(in srgb, var(--accent, #4F9D69) 36%, transparent)",
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
