import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "menumenu — See the Flavor";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #050505 0%, #1a1a2e 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 80,
            fontWeight: 700,
            background: "linear-gradient(135deg, #FF4B2B 0%, #FF416C 100%)",
            backgroundClip: "text",
            color: "transparent",
            marginBottom: 24,
          }}
        >
          menumenu
        </div>
        <div
          style={{
            fontSize: 32,
            color: "#A1A1AA",
            marginBottom: 8,
          }}
        >
          Don&apos;t just read the menu.
        </div>
        <div
          style={{
            fontSize: 36,
            fontWeight: 600,
            color: "#EDEDED",
          }}
        >
          See the flavor.
        </div>
      </div>
    ),
    { ...size }
  );
}
