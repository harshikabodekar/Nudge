export default function NudgeFooter() {
  return (
    <footer
      style={{
        maxWidth: 1080,
        margin: "0 auto",
        padding: "26px 22px 36px",
        borderTop: "1px solid rgba(120,105,80,.1)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 12,
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-quicksand), sans-serif",
          fontWeight: 700,
          fontSize: 15,
          color: "#9A907E",
        }}
      >
        Nudge
      </span>
      <span style={{ fontSize: 13, fontWeight: 600, color: "#B3A998" }}>
        A gentle push into your first investment · not financial advice
      </span>
    </footer>
  );
}
