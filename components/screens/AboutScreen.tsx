"use client";

import LearnedPanel from "@/components/LearnedPanel";
import GoalProgress from "@/components/screens/trade/GoalProgress";
import type { Goal } from "@/lib/goal";

const WHY_ITEMS = [
  {
    icon: "📉",
    title: "Inflation quietly eats your savings",
    text: "₹10,000 in a savings account earning 3–4% interest loses real value every year if inflation runs higher. Investing is one of the few ways to stay ahead of it.",
  },
  {
    icon: "⏳",
    title: "Time in the market beats timing the market",
    text: "The investor who starts imperfectly — early, with small amounts — almost always does better than the one who waits for the perfect moment. That moment rarely comes.",
  },
  {
    icon: "🌱",
    title: "You don't need much to start",
    text: "Some shares cost less than ₹500. You don't need to be rich to invest — you just need to understand what you're doing before you put a single rupee in.",
  },
  {
    icon: "🧠",
    title: "The real risk is doing nothing",
    text: "Not investing has a cost too — it's just invisible. Nudge won't push you to buy anything. But it will help you understand the landscape so the choice is actually yours.",
  },
];

export default function AboutScreen({
  goal,
  totalValue,
  onExplore,
  onChangeGoal,
}: {
  goal: Goal | null;
  totalValue: number;
  onExplore: () => void;
  onChangeGoal: () => void;
}) {
  return (
    <main
      style={{
        maxWidth: 760,
        margin: "0 auto",
        padding: "clamp(36px, 6vw, 72px) 22px 90px",
      }}
    >
      <div style={{ animation: "nudgeRise .5s ease both" }}>
        <span
          style={{
            fontFamily: "var(--font-quicksand), sans-serif",
            fontWeight: 700,
            fontSize: 13,
            letterSpacing: 1,
            textTransform: "uppercase",
            color: "var(--accent, #4F9D69)",
          }}
        >
          What is Nudge
        </span>
        <h2
          style={{
            fontFamily: "var(--font-quicksand), sans-serif",
            fontWeight: 700,
            fontSize: "clamp(30px, 5vw, 46px)",
            lineHeight: 1.12,
            letterSpacing: "-.8px",
            margin: "12px 0 20px",
            color: "#2B2620",
          }}
        >
          A calm, knowledgeable friend who happens to know the stock market really well.
        </h2>
        <p
          style={{
            fontSize: "clamp(17px, 2vw, 19px)",
            lineHeight: 1.6,
            color: "#5C544A",
            fontWeight: 500,
            margin: "0 0 16px",
          }}
        >
          Nudge is a beginner-first investment companion. It doesn&apos;t execute trades.
          It doesn&apos;t bury you in charts. It just — talks to you about one company at a time,
          in plain language.
        </p>
        <p
          style={{
            fontSize: "clamp(18px, 2.2vw, 21px)",
            lineHeight: 1.55,
            color: "#2B2620",
            fontWeight: 700,
            fontFamily: "var(--font-quicksand), sans-serif",
            margin: "0 0 40px",
          }}
        >
          No jargon. No pressure. Just your first nudge.
        </p>
      </div>

      {/* Why investing matters */}
      <div
        style={{
          background: "#FFFDF9",
          border: "1px solid rgba(120,105,80,.12)",
          borderRadius: "calc(var(--radius, 24px) + 6px)",
          padding: "clamp(24px, 4vw, 34px)",
          boxShadow: "0 24px 60px -34px rgba(80,65,40,.45)",
          marginBottom: 28,
        }}
      >
        <h3
          style={{
            fontFamily: "var(--font-quicksand), sans-serif",
            fontWeight: 700,
            fontSize: 20,
            margin: "0 0 20px",
            color: "#2B2620",
          }}
        >
          Why does investing even matter?
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {WHY_ITEMS.map((item) => (
            <div key={item.title} style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
              <span
                style={{
                  flex: "none",
                  width: 44,
                  height: 44,
                  borderRadius: 14,
                  background: "color-mix(in srgb, var(--accent, #4F9D69) 11%, #fff)",
                  border: "1px solid color-mix(in srgb, var(--accent, #4F9D69) 18%, transparent)",
                  display: "grid",
                  placeItems: "center",
                  fontSize: 20,
                }}
              >
                {item.icon}
              </span>
              <div>
                <div
                  style={{
                    fontFamily: "var(--font-quicksand), sans-serif",
                    fontWeight: 700,
                    fontSize: 16,
                    color: "#2B2620",
                    marginBottom: 4,
                  }}
                >
                  {item.title}
                </div>
                <p
                  style={{
                    margin: 0,
                    fontSize: 15,
                    lineHeight: 1.55,
                    fontWeight: 500,
                    color: "#4A4339",
                  }}
                >
                  {item.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Your progress */}
      {goal && (
        <div style={{ marginBottom: 28 }}>
          <h3
            style={{
              fontFamily: "var(--font-quicksand), sans-serif",
              fontWeight: 700,
              fontSize: 20,
              margin: "0 0 14px",
              color: "#2B2620",
            }}
          >
            Your progress
          </h3>
          <GoalProgress goal={goal} totalValue={totalValue} />
        </div>
      )}

      {/* What you've learned */}
      <div style={{ marginBottom: 32 }}>
        <h3
          style={{
            fontFamily: "var(--font-quicksand), sans-serif",
            fontWeight: 700,
            fontSize: 20,
            margin: "0 0 4px",
            color: "#2B2620",
          }}
        >
          What you&apos;ve picked up
        </h3>
        <p style={{ fontSize: 14.5, fontWeight: 500, color: "#6A6155", margin: "0 0 14px", lineHeight: 1.5 }}>
          Every time you tap a term explainer in the app, it gets quietly added here. No account needed.
        </p>
        <LearnedPanel />
      </div>

      {/* What Nudge is */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 14,
          marginBottom: 36,
        }}
      >
        {[
          { title: "Zero jargon", text: "Every term gets explained right where you read it." },
          { title: "No pressure", text: "We never tell you to buy or sell. Just the full picture." },
          { title: "No signup", text: "Start exploring instantly. Nothing to lose." },
        ].map((p) => (
          <div
            key={p.title}
            style={{
              background: "color-mix(in srgb, var(--accent, #4F9D69) 8%, #FFFDF9)",
              border: "1px solid color-mix(in srgb, var(--accent, #4F9D69) 18%, transparent)",
              borderRadius: "var(--radius, 24px)",
              padding: 20,
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-quicksand), sans-serif",
                fontWeight: 700,
                fontSize: 16,
                color: "color-mix(in srgb, var(--accent, #4F9D69) 80%, #2B2620)",
                marginBottom: 6,
              }}
            >
              {p.title}
            </div>
            <div style={{ fontSize: 14.5, lineHeight: 1.5, fontWeight: 500, color: "#6A6155" }}>
              {p.text}
            </div>
          </div>
        ))}
      </div>

      <div style={{ textAlign: "center" }}>
        <button
          onClick={onExplore}
          style={{
            fontFamily: "var(--font-quicksand), sans-serif",
            fontWeight: 700,
            fontSize: 17,
            color: "#fff",
            background: "var(--accent, #4F9D69)",
            border: "none",
            cursor: "pointer",
            padding: "16px 30px",
            borderRadius: 999,
            boxShadow:
              "0 12px 26px color-mix(in srgb, var(--accent, #4F9D69) 38%, transparent)",
          }}
        >
          Okay, I&apos;m ready — let&apos;s look at one &nbsp;→
        </button>
        <div style={{ marginTop: 18 }}>
          <button
            onClick={onChangeGoal}
            style={{
              fontFamily: "var(--font-nunito), sans-serif",
              fontWeight: 600,
              fontSize: 13.5,
              color: "#A89E8B",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              textDecoration: "underline",
              textUnderlineOffset: 3,
            }}
          >
            change my savings goal
          </button>
        </div>
      </div>
    </main>
  );
}
