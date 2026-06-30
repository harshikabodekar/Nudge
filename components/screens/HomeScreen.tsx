"use client";

const TOUR_MESSAGES: { text: string; accent?: boolean }[] = [
  { text: "hey! before we dive in — quick intro 👋", accent: true },
  {
    text: "the stock market is basically a place where companies list themselves, and people like you and me can buy tiny pieces of them.",
  },
  {
    text: "when a company does well, your piece becomes more valuable. when it doesn't, it dips a bit. that's literally it at the core.",
  },
  {
    text: "you don't need lakhs to start. some shares cost less than ₹100. and you don't need to stare at a screen all day.",
  },
  { text: "ready to look at your first company? let's go →", accent: true },
];

export default function HomeScreen({ onExplore }: { onExplore: () => void }) {
  return (
    <main
      className="nudge-hero-grid"
      style={{
        maxWidth: 1080,
        margin: "0 auto",
        padding: "clamp(40px, 7vw, 88px) 22px 80px",
        display: "grid",
        gridTemplateColumns: "minmax(0, 1.05fr) minmax(0, .95fr)",
        gap: "clamp(32px, 5vw, 64px)",
        alignItems: "center",
      }}
    >
      <div style={{ animation: "nudgeRise .6s ease both" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "7px 14px",
            borderRadius: 999,
            background: "color-mix(in srgb, var(--accent, #4F9D69) 14%, #fff)",
            color: "color-mix(in srgb, var(--accent, #4F9D69) 78%, #2E2922)",
            fontWeight: 700,
            fontSize: 13,
            marginBottom: 22,
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "var(--accent, #4F9D69)",
            }}
          />
          Your first nudge into investing
        </div>
        <h1
          style={{
            fontFamily: "var(--font-quicksand), sans-serif",
            fontWeight: 700,
            fontSize: "clamp(34px, 5.4vw, 56px)",
            lineHeight: 1.08,
            letterSpacing: "-1px",
            margin: "0 0 22px",
            color: "#2B2620",
          }}
        >
          The stock market isn&apos;t scary. It&apos;s just no one explained it
          like a friend.
          <span style={{ color: "var(--accent, #4F9D69)" }}> Nudge does.</span>
        </h1>
        <p
          style={{
            fontSize: "clamp(17px, 2vw, 20px)",
            lineHeight: 1.55,
            color: "#6A6155",
            maxWidth: 460,
            margin: "0 0 32px",
            fontWeight: 500,
          }}
        >
          Search any company. Get a plain-language breakdown. No jargon. No
          pressure. Just your first nudge.
        </p>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: 14,
          }}
        >
          <button
            onClick={onExplore}
            className="nudge-hero-cta"
            style={{
              fontFamily: "var(--font-quicksand), sans-serif",
              fontWeight: 700,
              fontSize: 17,
              color: "#fff",
              background: "var(--accent, #4F9D69)",
              border: "none",
              cursor: "pointer",
              padding: "16px 28px",
              borderRadius: 999,
              boxShadow:
                "0 12px 26px color-mix(in srgb, var(--accent, #4F9D69) 38%, transparent)",
            }}
          >
            Start exploring &nbsp;→
          </button>
          <span style={{ fontSize: 14, fontWeight: 700, color: "#9A907E" }}>
            No signup needed
          </span>
        </div>
      </div>

      {/* Onboarding tour card: friend texting you */}
      <div style={{ animation: "nudgeRise .7s ease .1s both" }}>
        <div
          style={{
            background: "#FFFDF9",
            border: "1px solid rgba(120,105,80,.12)",
            borderRadius: "calc(var(--radius, 24px) + 6px)",
            padding: "18px 18px 22px",
            boxShadow:
              "0 24px 60px -28px rgba(80,65,40,.45), 0 4px 14px -8px rgba(80,65,40,.2)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 11,
              padding: "4px 6px 16px",
              borderBottom: "1px solid rgba(120,105,80,.1)",
              marginBottom: 14,
            }}
          >
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
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: "var(--accent, #4F9D69)",
                  }}
                />
                online · here to help
              </div>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {TOUR_MESSAGES.map((msg, i) => (
              <div
                key={i}
                style={{
                  alignSelf: "flex-start",
                  maxWidth: "90%",
                  background: msg.accent
                    ? "color-mix(in srgb, var(--accent, #4F9D69) 16%, #fff)"
                    : "#F3EEE3",
                  color: msg.accent
                    ? "color-mix(in srgb, var(--accent, #4F9D69) 82%, #2E2922)"
                    : "#403A31",
                  padding: "12px 15px",
                  borderRadius: 20,
                  borderBottomLeftRadius: 7,
                  fontSize: 15,
                  lineHeight: 1.5,
                  fontWeight: 500,
                  boxShadow: "0 2px 8px -4px rgba(80,65,40,.18)",
                  animation: "bubbleIn .4s ease both",
                }}
              >
                {msg.text}
              </div>
            ))}
            <div
              style={{
                alignSelf: "flex-start",
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "11px 16px",
                background: "#F1ECE1",
                borderRadius: 20,
                borderBottomLeftRadius: 7,
              }}
            >
              {[0, 0.2, 0.4].map((delay) => (
                <span
                  key={delay}
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: "#C3B9A6",
                    animation: `bubbleIn 1s ease ${delay}s infinite alternate`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
        <p
          style={{
            textAlign: "center",
            fontSize: 13,
            fontWeight: 600,
            color: "#A89E8B",
            margin: "14px 0 0",
          }}
        >
          ↑ this is how Nudge talks. like a friend, not a textbook.
        </p>
      </div>
    </main>
  );
}
