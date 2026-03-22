"use client";

import type { SavedMenu } from "@/types/menu";
import { REGION_FLAGS } from "@/data/constants";

interface Props {
  history: SavedMenu[];
  onSelect: (saved: SavedMenu) => void;
  onBack: () => void;
  onDelete: (id: string) => void;
}

function formatDate(timestamp: number): string {
  const d = new Date(timestamp);
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const hours = d.getHours().toString().padStart(2, "0");
  const minutes = d.getMinutes().toString().padStart(2, "0");
  return `${month}/${day} ${hours}:${minutes}`;
}

function dishCount(saved: SavedMenu): number {
  return saved.menu.sections.reduce((sum, s) => sum + s.dishes.length, 0);
}

export function HistoryView({ history, onSelect, onBack, onDelete }: Props) {
  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.5rem",
        }}
      >
        <button
          onClick={onBack}
          style={{
            background: "none",
            border: "none",
            color: "var(--foreground-muted)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "5px",
            fontSize: "0.9rem",
            fontFamily: "var(--font-heading)",
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <span
          style={{
            fontSize: "0.75rem",
            color: "var(--foreground-muted)",
            fontFamily: "var(--font-heading)",
          }}
        >
          {history.length} saved
        </span>
      </div>

      {history.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 20px",
            color: "var(--foreground-muted)",
          }}
        >
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ opacity: 0.3, marginBottom: "16px" }}
          >
            <path d="M12 8v4l3 3" />
            <circle cx="12" cy="12" r="10" />
          </svg>
          <p style={{ fontSize: "0.95rem", marginBottom: "4px" }}>
            No saved menus yet
          </p>
          <p style={{ fontSize: "0.8rem" }}>
            Scan a menu to start building your history
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {history.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelect(item)}
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "14px",
                padding: "16px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "14px",
                transition: "background 0.15s ease",
              }}
            >
              {/* Flag */}
              <span style={{ fontSize: "1.5rem" }}>
                {REGION_FLAGS[item.regionCode] || "🌍"}
              </span>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    fontSize: "0.95rem",
                    fontWeight: 600,
                    color: "var(--foreground)",
                    marginBottom: "2px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {item.menu.restaurantName || "Unknown Restaurant"}
                </p>
                <p
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--foreground-muted)",
                  }}
                >
                  {formatDate(item.savedAt)} · {dishCount(item)} dishes ·{" "}
                  {item.targetLang === "Japanese" ? "🇯🇵" : "🇬🇧"}
                </p>
              </div>

              {/* Delete button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(item.id);
                }}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--foreground-muted)",
                  cursor: "pointer",
                  padding: "6px",
                  opacity: 0.4,
                  fontSize: "0.8rem",
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
