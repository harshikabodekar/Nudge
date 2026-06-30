export default function ExplainerPanel({ label, explain }: { label: string; explain: string }) {
  return (
    <div
      style={{
        marginTop: 14,
        display: "flex",
        gap: 11,
        alignItems: "flex-start",
        padding: "15px 16px",
        background: "color-mix(in srgb, var(--accent, #4F9D69) 10%, #fff)",
        border: "1px solid color-mix(in srgb, var(--accent, #4F9D69) 22%, transparent)",
        borderRadius: 16,
        animation: "bubbleIn .3s ease both",
      }}
    >
      <span style={{ fontSize: 18 }}>💡</span>
      <div>
        <div
          style={{
            fontFamily: "var(--font-quicksand), sans-serif",
            fontWeight: 700,
            fontSize: 14,
            color: "color-mix(in srgb, var(--accent, #4F9D69) 80%, #2B2620)",
            marginBottom: 3,
          }}
        >
          {label}
        </div>
        <p
          style={{
            margin: 0,
            fontSize: 15.5,
            lineHeight: 1.5,
            fontWeight: 500,
            color: "#4A4339",
          }}
        >
          {explain}
        </p>
      </div>
    </div>
  );
}
