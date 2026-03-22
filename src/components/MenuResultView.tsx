"use client";

import type { MenuResult } from "@/types/menu";
import type { RefObject } from "react";

interface Props {
  menu: MenuResult;
  heroImage: string | null;
  heroLoading: boolean;
  heroError: string | null;
  saving: boolean;
  captureRef: RefObject<HTMLDivElement | null>;
  onBack: () => void;
  onShare: () => void;
  onSave: () => void;
  onRetryHero: () => void;
}

export function MenuResultView({
  menu,
  heroImage,
  heroLoading,
  heroError,
  saving,
  captureRef,
  onBack,
  onShare,
  onSave,
  onRetryHero,
}: Props) {
  return (
    <div className="animate-fade-in">
      {/* Toolbar */}
      <div
        className="no-print"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1rem",
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
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={onShare}
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "10px",
              color: "var(--foreground-muted)",
              cursor: "pointer",
              padding: "8px 14px",
              fontSize: "0.85rem",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontFamily: "var(--font-heading)",
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
              <polyline points="16 6 12 2 8 6" />
              <line x1="12" y1="2" x2="12" y2="15" />
            </svg>
            Share
          </button>
          <button
            onClick={onSave}
            disabled={saving}
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "10px",
              color: "var(--foreground-muted)",
              cursor: saving ? "default" : "pointer",
              padding: "8px 14px",
              fontSize: "0.85rem",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              opacity: saving ? 0.5 : 1,
              fontFamily: "var(--font-heading)",
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      {/* Capture area for Save Image */}
      <div ref={captureRef} className="menu-result-container">
        {/* Background Image Layer */}
        {(heroLoading || heroImage || heroError) && (
          <div className="menu-bg-layer no-print">
            {heroLoading ? (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "rgba(30,36,50,0.6)",
                }}
              >
                <div
                  className="loading-spinner"
                  style={{
                    borderColor: "rgba(255,255,255,0.2)",
                    borderTopColor: "#FFFFFF",
                  }}
                />
              </div>
            ) : heroImage ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={heroImage}
                  alt="Table spread background"
                  className="menu-bg-image animate-fade-in"
                />
                <div
                  style={{
                    position: "absolute",
                    bottom: "12px",
                    right: "12px",
                    zIndex: 5,
                    background: "rgba(0,0,0,0.5)",
                    color: "rgba(255,255,255,0.75)",
                    padding: "4px 8px",
                    borderRadius: "4px",
                    fontSize: "0.65rem",
                    backdropFilter: "blur(4px)",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  AI Generated
                </div>
              </>
            ) : heroError ? (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "rgba(30,36,50,0.7)",
                }}
              >
                <p
                  style={{
                    color: "rgba(255,255,255,0.7)",
                    fontSize: "0.85rem",
                    marginBottom: "1rem",
                  }}
                >
                  {heroError}
                </p>
                <button
                  onClick={onRetryHero}
                  style={{
                    background: "transparent",
                    border: "1px solid rgba(255,255,255,0.25)",
                    color: "#FFFFFF",
                    padding: "8px 16px",
                    borderRadius: "10px",
                    cursor: "pointer",
                    fontSize: "0.85rem",
                    fontFamily: "var(--font-heading)",
                  }}
                >
                  Retry
                </button>
              </div>
            ) : null}
          </div>
        )}

        {/* Menu Card */}
        <div className="menu-card">
          {/* Restaurant Header */}
          {menu.restaurantName && (
            <div className="menu-header">
              <h2 className="menu-restaurant-name">{menu.restaurantName}</h2>
              {menu.restaurantVibe && (
                <p className="menu-vibe">{menu.restaurantVibe}</p>
              )}
            </div>
          )}

          {/* Sections */}
          {menu.sections.map((section, sIdx) => (
            <div key={sIdx} className="menu-section">
              <div className="menu-section-header">
                <h3 className="menu-section-title">
                  {section.translatedTitle}
                </h3>
                <span className="menu-section-original">
                  {section.originalTitle}
                </span>
              </div>

              <div className="menu-items">
                {section.dishes.map((dish, dIdx) => (
                  <div key={dIdx} className="menu-item">
                    <div className="menu-item-content">
                      <div className="menu-item-header">
                        <div className="menu-item-names">
                          <span className="menu-item-translated">
                            {dish.translatedName}
                          </span>
                          <span className="menu-item-original">
                            {dish.originalName}
                          </span>
                        </div>
                        {dish.price && (
                          <span className="menu-item-price">{dish.price}</span>
                        )}
                      </div>
                      {dish.description && (
                        <p className="menu-item-description">
                          {dish.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Footer */}
          <div className="menu-footer">
            <p>
              Translated by{" "}
              <span
                className="nomameshi-logo-reversed"
                style={{ fontSize: "inherit" }}
              >
                noma<span className="accent">meshi</span>
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
