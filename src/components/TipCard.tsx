interface Props {
  tipIndex: number;
  tipText: string;
  countryFlag?: string;
  countryLabel?: string;
  analyzing: boolean;
  onNext: () => void;
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchEnd: (e: React.TouchEvent) => void;
}

export function TipCard({
  tipIndex,
  tipText,
  countryFlag,
  countryLabel,
  analyzing,
  onNext,
  onTouchStart,
  onTouchEnd,
}: Props) {
  return (
    <div
      style={{ display: "flex", flexDirection: "column", gap: "12px" }}
      className={analyzing ? "animate-fade-in" : undefined}
    >
      {/* LOCAL TIP header */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--accent)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 3l1.9 5.8L20 11l-5.3 3.8L16 21l-4-3-4 3 1.3-6.2L4 11l6.1-2.2z" />
        </svg>
        <span
          style={{
            fontSize: "0.7rem",
            fontWeight: 600,
            letterSpacing: "2px",
            color: "var(--accent)",
            fontFamily: "var(--font-heading)",
          }}
        >
          LOCAL TIP
        </span>
      </div>

      {/* Tip card */}
      <div
        onClick={onNext}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        style={{
          background: "var(--gradient-warm-card)",
          border: "1px solid var(--border-warm)",
          borderRadius: "var(--radius-md)",
          padding: "20px",
          cursor: "pointer",
          position: "relative",
          boxShadow: "var(--shadow-soft)",
        }}
      >
        <div
          style={{
            width: "36px",
            height: "3px",
            background: "var(--primary)",
            borderRadius: "2px",
            marginBottom: "12px",
          }}
        />
        <span
          style={{
            position: "absolute",
            left: "8px",
            top: "50%",
            transform: "translateY(-50%)",
            fontSize: "1.2rem",
            color: "var(--foreground-muted)",
            opacity: 0.2,
            pointerEvents: "none",
            userSelect: "none",
          }}
        >
          ‹
        </span>
        <span
          style={{
            position: "absolute",
            right: "8px",
            top: "50%",
            transform: "translateY(-50%)",
            fontSize: "1.2rem",
            color: "var(--foreground-muted)",
            opacity: 0.2,
            pointerEvents: "none",
            userSelect: "none",
          }}
        >
          ›
        </span>
        <p
          key={tipIndex}
          className="animate-fade-in"
          style={{
            fontSize: "0.9rem",
            color: "var(--foreground)",
            lineHeight: 1.5,
            minHeight: "3rem",
            marginBottom: "12px",
          }}
        >
          {tipText}
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          {countryFlag && (
            <span style={{ fontSize: "0.9rem" }}>{countryFlag}</span>
          )}
          <span
            style={{
              fontSize: "0.75rem",
              color: "var(--foreground-muted)",
              fontWeight: 500,
            }}
          >
            {countryLabel ||
              (analyzing ? "Detecting..." : "Select a region for tips")}
          </span>
        </div>
      </div>

      {/* AI disclaimer - only during analyzing */}
      {analyzing && (
        <p
          style={{
            fontSize: "0.65rem",
            color: "var(--foreground-muted)",
            textAlign: "center",
          }}
        >
          ※以降表示される料理の説明文はAIによる参考情報（推論）です。
        </p>
      )}
    </div>
  );
}
