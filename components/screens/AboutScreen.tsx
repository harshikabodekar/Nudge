"use client";

const AUDIENCE = [
  {
    icon: "🎓",
    text: "College students curious about investing but too scared to start.",
  },
  {
    icon: "💼",
    text: 'Young working adults with ₹500 they want to "try" the market with.',
  },
  {
    icon: "😮‍💨",
    text: "Anyone who opened a trading app, got overwhelmed, and quietly closed it.",
  },
];

const PROMISES = [
  {
    title: "Zero jargon",
    text: "Every term gets explained right where you read it.",
  },
  {
    title: "No pressure",
    text: 'We never say "buy" or "sell". Just "here’s the picture".',
  },
  {
    title: "No signup",
    text: "Start exploring instantly. Nothing to lose.",
  },
];

export default function AboutScreen({ onExplore }: { onExplore: () => void }) {
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
            margin: "12px 0 24px",
            color: "#2B2620",
          }}
        >
          A calm, knowledgeable friend who happens to know the stock market
          really well.
        </h2>
        <p
          style={{
            fontSize: "clamp(17px, 2vw, 19px)",
            lineHeight: 1.6,
            color: "#5C544A",
            fontWeight: 500,
            margin: "0 0 18px",
          }}
        >
          Nudge is a beginner-first investment companion. It doesn&apos;t
          execute trades. It doesn&apos;t bury you in charts. It just — talks
          to you.
        </p>
        <p
          style={{
            fontSize: "clamp(17px, 2vw, 19px)",
            lineHeight: 1.6,
            color: "#5C544A",
            fontWeight: 500,
            margin: "0 0 18px",
          }}
        >
          You get a friendly tour of how investing works. You pick a company
          you&apos;re curious about. Nudge gives you a plain-language
          breakdown — what it does, how it&apos;s doing, and whether a
          first-timer should even consider it right now.
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
          No jargon. No fear. Just your first nudge.
        </p>
      </div>

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
            margin: "0 0 18px",
            color: "#2B2620",
          }}
        >
          Who it&apos;s for
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {AUDIENCE.map((who) => (
            <div
              key={who.text}
              style={{ display: "flex", alignItems: "flex-start", gap: 14 }}
            >
              <span
                style={{
                  flex: "none",
                  width: 40,
                  height: 40,
                  borderRadius: 13,
                  background: "color-mix(in srgb, var(--accent, #4F9D69) 13%, #fff)",
                  display: "grid",
                  placeItems: "center",
                  fontSize: 19,
                }}
              >
                {who.icon}
              </span>
              <p
                style={{
                  margin: 0,
                  fontSize: 16.5,
                  lineHeight: 1.5,
                  fontWeight: 500,
                  color: "#4A4339",
                  paddingTop: 8,
                }}
              >
                {who.text}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 14,
          marginBottom: 40,
        }}
      >
        {PROMISES.map((p) => (
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
            <div
              style={{
                fontSize: 14.5,
                lineHeight: 1.5,
                fontWeight: 500,
                color: "#6A6155",
              }}
            >
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
      </div>
    </main>
  );
}
