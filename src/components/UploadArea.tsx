interface Props {
  analyzing: boolean;
  handleScan: () => void;
  handlePaste: () => void;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function UploadArea({
  analyzing,
  handleScan,
  handlePaste,
  handleFileUpload,
}: Props) {
  return (
    <div
      style={{
        background: "var(--gradient-warm-card)",
        border: "1.5px solid var(--border-warm)",
        borderRadius: "20px",
        padding: "36px 24px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "22px",
        minHeight: "300px",
        justifyContent: "center",
        boxShadow: "var(--shadow-soft)",
      }}
    >
      {/* Camera icon circle — hero treatment */}
      <div
        style={{
          width: "104px",
          height: "104px",
          borderRadius: "50%",
          background: "var(--gradient-hero)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          boxShadow: "var(--shadow-hero)",
        }}
      >
        {analyzing ? (
          <div
            style={{
              width: "40px",
              height: "40px",
              border: "3px solid rgba(232,90,79,0.2)",
              borderRadius: "50%",
              borderTopColor: "var(--primary)",
              animation: "spin 1s ease-in-out infinite",
            }}
          />
        ) : (
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--primary)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
            <circle cx="12" cy="13" r="4" />
          </svg>
        )}
      </div>

      <div style={{ textAlign: "center" }}>
        <h2
          style={{
            fontSize: "1.4rem",
            fontWeight: 600,
            marginBottom: "6px",
            color: "var(--foreground)",
            letterSpacing: "-0.02em",
          }}
        >
          {analyzing ? "Analyzing menu..." : "Scan a menu"}
        </h2>
        <p style={{ color: "var(--foreground-muted)", fontSize: "0.875rem" }}>
          {analyzing
            ? "Detecting dishes and translating"
            : "Take a photo or upload from gallery"}
        </p>
      </div>

      {/* Buttons row */}
      <div style={{ display: "flex", gap: "12px", width: "100%" }}>
        <button
          onClick={handleScan}
          disabled={analyzing}
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            padding: "13px 16px",
            borderRadius: "12px",
            background: "var(--primary)",
            color: "#FFFFFF",
            fontFamily: "var(--font-heading)",
            fontWeight: 600,
            fontSize: "0.95rem",
            cursor: analyzing ? "default" : "pointer",
            opacity: analyzing ? 0.6 : 1,
            border: "none",
          }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
            <circle cx="12" cy="13" r="4" />
          </svg>
          Scan
        </button>
        <input
          id="menu-upload"
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          style={{ display: "none" }}
          disabled={analyzing}
        />

        <button
          onClick={handlePaste}
          disabled={analyzing}
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            padding: "13px 16px",
            borderRadius: "12px",
            background: "var(--surface)",
            border: "1px solid var(--border)",
            color: "var(--foreground)",
            fontFamily: "var(--font-heading)",
            fontWeight: 600,
            fontSize: "0.95rem",
            cursor: analyzing ? "default" : "pointer",
            opacity: analyzing ? 0.6 : 1,
          }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
          Upload
        </button>
      </div>
    </div>
  );
}
