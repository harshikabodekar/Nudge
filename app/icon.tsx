import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#4F9D69",
          borderRadius: "7px",
          color: "white",
          fontWeight: 700,
          fontSize: 22,
          fontFamily: "sans-serif",
        }}
      >
        n
      </div>
    ),
    { ...size }
  );
}
