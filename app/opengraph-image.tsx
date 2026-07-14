import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          background: "#F4EEE3",
          padding: "80px 90px",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Logo row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: 48,
          }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 20,
              background: "#4F9D69",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: 44,
              fontWeight: 700,
              marginRight: 22,
            }}
          >
            n
          </div>
          <span
            style={{
              fontSize: 56,
              fontWeight: 700,
              color: "#2B2620",
            }}
          >
            Nudge
          </span>
        </div>

        {/* Headline — flex wrap so mixed-colour spans stay inline */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "flex-start",
            fontSize: 60,
            fontWeight: 700,
            lineHeight: 1.15,
            maxWidth: 920,
            marginBottom: 36,
          }}
        >
          <span style={{ color: "#2B2620", marginRight: 16 }}>
            Investing for people who find investing
          </span>
          <span style={{ color: "#4F9D69" }}>scary.</span>
        </div>

        {/* Subtitle */}
        <div
          style={{
            display: "flex",
            fontSize: 30,
            fontWeight: 600,
            color: "#6A6155",
          }}
        >
          Plain language · Real companies · Practice with fake money
        </div>

        {/* Bottom-right badge */}
        <div
          style={{
            position: "absolute",
            bottom: 64,
            right: 90,
            display: "flex",
            alignItems: "center",
            padding: "12px 24px",
            background: "rgba(79,157,105,0.13)",
            borderRadius: 999,
            border: "1.5px solid rgba(79,157,105,0.38)",
          }}
        >
          <span
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: "#36774A",
            }}
          >
            No signup needed
          </span>
        </div>
      </div>
    ),
    { ...size }
  );
}
