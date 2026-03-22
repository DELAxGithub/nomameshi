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
        borderRadius: "12px",
        overflow: "hidden",
      }}
    >
      {LANGUAGES.map((lang) => (
        <button
          key={lang.code}
          onClick={() => setTargetLang(lang.code)}
          disabled={analyzing}
          style={{
            padding: "10px 14px",
            border: "none",
            fontSize: "0.9rem",
            fontFamily: "var(--font-heading)",
            fontWeight: targetLang === lang.code ? 600 : 400,
            cursor: "pointer",
            background:
              targetLang === lang.code
                ? "var(--surface-highlight)"
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
