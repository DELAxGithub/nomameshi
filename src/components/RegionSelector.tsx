"use client";

import { useState } from "react";
import { REGIONS, REGION_FLAGS } from "@/data/constants";

interface Props {
  selectedRegion: string;
  setSelectedRegion: (code: string) => void;
  analyzing: boolean;
}

export function RegionSelector({
  selectedRegion,
  setSelectedRegion,
  analyzing,
}: Props) {
  const [showPicker, setShowPicker] = useState(false);
  const regionLabel =
    REGIONS.find((r) => r.code === selectedRegion)?.label || "Auto-Detect";

  const btnStyle = {
    display: "flex" as const,
    alignItems: "center" as const,
    gap: "10px",
    flex: 1,
    padding: "12px 16px",
    borderRadius: "12px",
    border: `1px solid ${showPicker ? "var(--primary)" : "var(--border)"}`,
    background: showPicker ? "rgba(232,90,79,0.06)" : "var(--surface)",
    color: "var(--foreground)",
    fontSize: "0.9rem",
    fontFamily: "var(--font-heading)",
    fontWeight: 500 as const,
    cursor: "pointer" as const,
  };

  return (
    <div style={{ position: "relative", flex: 1 }}>
      <button
        onClick={() => setShowPicker(!showPicker)}
        disabled={analyzing}
        style={btnStyle}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--primary)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
        <span style={{ flex: 1, textAlign: "left" }}>{regionLabel}</span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#ABABAB"
          strokeWidth="2"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {showPicker && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            right: 0,
            zIndex: 50,
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "12px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
            overflow: "hidden",
          }}
        >
          {REGIONS.map((region) => (
            <button
              key={region.code}
              onClick={() => {
                setSelectedRegion(region.code);
                setShowPicker(false);
              }}
              style={{
                display: "block",
                width: "100%",
                padding: "10px 16px",
                border: "none",
                background:
                  selectedRegion === region.code
                    ? "var(--surface-highlight)"
                    : "transparent",
                color: "var(--foreground)",
                fontSize: "0.9rem",
                fontFamily: "var(--font-heading)",
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              {REGION_FLAGS[region.code]
                ? `${REGION_FLAGS[region.code]} `
                : ""}
              {region.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
