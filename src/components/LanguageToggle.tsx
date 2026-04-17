import { LANGUAGES } from "@/data/constants";

interface Props {
  targetLang: string;
  setTargetLang: (code: string) => void;
  analyzing: boolean;
}

export function LanguageToggle({
  targetLang,
  setTargetLang,
  analyzing,
}: Props) {
  return (
    <div
      style={{
        display: "flex",
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-pill)",
        overflow: "hidden",
        padding: "3px",
        gap: "2px",
        flexShrink: 0,
      }}
    >
      {LANGUAGES.map((lang) => (
        <button
          key={lang.code}
          onClick={() => setTargetLang(lang.code)}
          disabled={analyzing}
          style={{
            padding: "7px 12px",
            border: "none",
            fontSize: "0.85rem",
            fontFamily: "var(--font-heading)",
            fontWeight: targetLang === lang.code ? 600 : 500,
            cursor: "pointer",
            borderRadius: "var(--radius-pill)",
            background:
              targetLang === lang.code
                ? "var(--primary-soft)"
                : "transparent",
            color:
              targetLang === lang.code
                ? "var(--primary)"
                : "var(--foreground-muted)",
            transition: "all 0.2s ease",
          }}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
}
