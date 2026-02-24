"use client";

import { useState, useRef } from "react";
import html2canvas from "html2canvas";

interface Dish {
  originalName: string;
  translatedName: string;
  description: string;
  price?: string | null;
  imageQuery: string;
}

interface Section {
  originalTitle: string;
  translatedTitle: string;
  dishes: Dish[];
}

interface MenuResult {
  restaurantName?: string | null;
  restaurantVibe?: string;
  language?: string;
  sections: Section[];
}

const LANGUAGES = [
  { code: "Japanese", label: "日本語" },
  { code: "English", label: "English" },
  { code: "Chinese", label: "中文" },
  { code: "Korean", label: "한국어" },
  { code: "Spanish", label: "Español" },
  { code: "French", label: "Français" },
];

export default function Home() {
  const [analyzing, setAnalyzing] = useState(false);
  const [menu, setMenu] = useState<MenuResult | null>(null);
  const [heroImage, setHeroImage] = useState<string | null>(null);
  const [heroLoading, setHeroLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [targetLang, setTargetLang] = useState("Japanese");

  const generateTableImage = async (sections: Section[]) => {
    setHeroLoading(true);
    try {
      const allDishes = sections.flatMap(s => s.dishes.map(d => d.imageQuery));
      const res = await fetch("/api/search-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dishes: allDishes }),
      });
      const data = await res.json();
      if (data.imageUrl) {
        setHeroImage(data.imageUrl);
      }
    } catch (err) {
      console.error("Table image generation failed:", err);
    } finally {
      setHeroLoading(false);
    }
  };

  const analyzeImage = async (dataUrl: string) => {
    setAnalyzing(true);
    setMenu(null);
    setHeroImage(null);
    setError(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: dataUrl, targetLang }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("API Error:", errorText);
        throw new Error(`Analysis failed: ${res.status}`);
      }

      const data = await res.json();
      let menuData: MenuResult;

      if (data.sections) {
        menuData = data;
      } else if (data.dishes) {
        menuData = {
          restaurantName: data.restaurantName || null,
          restaurantVibe: data.restaurant_vibe || "",
          sections: [{ originalTitle: "MENU", translatedTitle: "メニュー", dishes: data.dishes }],
        };
      } else {
        throw new Error("No menu data found");
      }

      setMenu(menuData);
      generateTableImage(menuData.sections);
    } catch (err) {
      console.error("Failed to analyze", err);
      const msg = err instanceof Error ? err.message : String(err);
      setError(`Analysis failed: ${msg}`);
    } finally {
      setAnalyzing(false);
    }
  };

  const blobToDataUrl = async (blob: Blob, maxWidth = 1600): Promise<string> => {
    const bitmap = await createImageBitmap(blob);
    const scale = bitmap.width > maxWidth ? maxWidth / bitmap.width : 1;
    const w = Math.round(bitmap.width * scale);
    const h = Math.round(bitmap.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(bitmap, 0, 0, w, h);
    bitmap.close();
    return canvas.toDataURL("image/jpeg", 0.8);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await blobToDataUrl(file);
    await analyzeImage(dataUrl);
  };

  const handlePaste = async () => {
    try {
      const items = await navigator.clipboard.read();
      for (const item of items) {
        const imageType = item.types.find(t => t.startsWith("image/"));
        if (imageType) {
          const blob = await item.getType(imageType);
          const dataUrl = await blobToDataUrl(blob);
          await analyzeImage(dataUrl);
          return;
        }
      }
      setError("No image found in clipboard.");
    } catch {
      setError("Clipboard access denied. Please use the upload button.");
    }
  };

  const captureRef = useRef<HTMLDivElement>(null);
  const [saving, setSaving] = useState(false);

  const handleSaveImage = async () => {
    if (!captureRef.current) return;
    setSaving(true);
    try {
      const canvas = await html2canvas(captureRef.current, {
        backgroundColor: "#0A0A0A",
        scale: 2,
        useCORS: true,
      });
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const fileName = `menumenu-${menu?.restaurantName?.replace(/\s+/g, "-") || "menu"}.png`;
        const file = new File([blob], fileName, { type: "image/png" });

        if (navigator.share && navigator.canShare?.({ files: [file] })) {
          try {
            await navigator.share({ files: [file] });
          } catch { /* user cancelled */ }
        } else {
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = fileName;
          a.click();
          URL.revokeObjectURL(url);
        }
        setSaving(false);
      }, "image/png");
    } catch (err) {
      console.error("Save image failed:", err);
      setSaving(false);
    }
  };

  const handleShare = async () => {
    if (!menu) return;
    const lines: string[] = [];
    if (menu.restaurantName) lines.push(menu.restaurantName);
    if (menu.restaurantVibe) lines.push(menu.restaurantVibe);
    lines.push("");
    for (const section of menu.sections) {
      lines.push(`── ${section.translatedTitle} (${section.originalTitle}) ──`);
      for (const dish of section.dishes) {
        const price = dish.price ? `  ${dish.price}` : "";
        lines.push(`${dish.translatedName} / ${dish.originalName}${price}`);
        if (dish.description) lines.push(`  ${dish.description}`);
      }
      lines.push("");
    }
    lines.push("Translated by menumenu\nhttps://menumenu-three.vercel.app");
    const text = lines.join("\n");

    if (navigator.share) {
      try {
        await navigator.share({ title: "menumenu", text });
      } catch { /* user cancelled */ }
    } else {
      await navigator.clipboard.writeText(text);
      alert("Copied to clipboard!");
    }
  };

  return (
    <main className="container" style={{ minHeight: "100vh", padding: "2rem 0" }}>
      {/* Header */}
      <div className="animate-fade-in no-print" style={{ textAlign: "center", marginBottom: "3rem", marginTop: "2rem" }}>
        <h1 style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>
          <span className="gradient-text">menumenu</span>
        </h1>
        <p style={{ color: "var(--foreground-muted)", fontSize: "1rem" }}>
          Don&apos;t just read the menu. <span style={{ color: "var(--foreground)" }}>See the flavor.</span>
        </p>
      </div>

      {error && (
        <div className="error-message animate-fade-in no-print">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          {error}
        </div>
      )}

      {!menu ? (
        /* SCAN MODE */
        <div className="animate-fade-in glass-panel" style={{ padding: "3rem 2rem", textAlign: "center" }}>
          <div style={{ marginBottom: "2rem", position: "relative", display: "inline-block" }}>
            <div style={{
              position: "absolute", inset: "-15px", borderRadius: "50%",
              border: "2px solid var(--primary)", opacity: analyzing ? 0.5 : 0,
              animation: analyzing ? "pulse 1.5s infinite" : "none"
            }}></div>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke={analyzing ? "var(--primary)" : "#555"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
          </div>

          <label htmlFor="menu-upload" className="btn-primary" style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            width: "100%", opacity: analyzing ? 0.8 : 1,
            pointerEvents: analyzing ? "none" : "auto", gap: "10px"
          }}>
            {analyzing ? (<><div className="loading-spinner"></div>Analyzing Menu...</>) : "Examine Menu"}
          </label>
          <input id="menu-upload" type="file" accept="image/*" onChange={handleFileUpload} style={{ display: "none" }} disabled={analyzing} />

          <button onClick={handlePaste} disabled={analyzing} style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            width: "100%", marginTop: "0.75rem", padding: "0.85rem 1.5rem",
            background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: "12px", color: "var(--foreground-muted)", fontSize: "1rem",
            cursor: analyzing ? "default" : "pointer", opacity: analyzing ? 0.5 : 1, gap: "8px",
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
            Paste Screenshot
          </button>

          {/* Language selector */}
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "6px", marginTop: "1.5rem" }}>
            {LANGUAGES.map(lang => (
              <button key={lang.code} onClick={() => setTargetLang(lang.code)} disabled={analyzing} style={{
                padding: "6px 14px", borderRadius: "20px", fontSize: "0.8rem", cursor: "pointer",
                border: targetLang === lang.code ? "1px solid var(--primary)" : "1px solid rgba(255,255,255,0.12)",
                background: targetLang === lang.code ? "rgba(255,75,43,0.15)" : "rgba(255,255,255,0.04)",
                color: targetLang === lang.code ? "var(--primary)" : "var(--foreground-muted)",
                opacity: analyzing ? 0.5 : 1,
              }}>
                {lang.label}
              </button>
            ))}
          </div>

          <p style={{ marginTop: "1rem", fontSize: "0.8rem", color: "#666" }}>
            {analyzing ? "Identifying dishes & translating..." : "Take a photo or paste a screenshot."}
          </p>
        </div>
      ) : (
        /* MENU RESULT MODE */
        <div className="animate-fade-in">
          {/* Toolbar */}
          <div className="no-print" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
            <button onClick={() => { setMenu(null); setHeroImage(null); }} style={{
              background: "none", border: "none", color: "var(--foreground-muted)",
              cursor: "pointer", display: "flex", alignItems: "center", gap: "5px", fontSize: "0.9rem"
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
              Scan another
            </button>
            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={handleShare} style={{
                background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: "8px", color: "var(--foreground-muted)", cursor: "pointer",
                padding: "6px 14px", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "6px"
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" y1="2" x2="12" y2="15" />
                </svg>
                Share
              </button>
              <button onClick={handleSaveImage} disabled={saving} style={{
                background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: "8px", color: "var(--foreground-muted)", cursor: saving ? "default" : "pointer",
                padding: "6px 14px", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "6px",
                opacity: saving ? 0.5 : 1,
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>

          {/* Capture area for Save Image */}
          <div ref={captureRef}>
          {/* Hero Table Image */}
          <div className="menu-hero">
            {heroLoading ? (
              <div className="menu-hero-loading">
                <div className="loading-spinner" style={{ width: 32, height: 32, borderWidth: 3 }}></div>
                <p style={{ marginTop: "0.75rem", color: "var(--foreground-muted)", fontSize: "0.85rem" }}>
                  Generating table spread...
                </p>
              </div>
            ) : heroImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={heroImage} alt="Table spread" className="menu-hero-img" />
            ) : null}
          </div>

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
                  <h3 className="menu-section-title">{section.translatedTitle}</h3>
                  <span className="menu-section-original">{section.originalTitle}</span>
                </div>

                <div className="menu-items">
                  {section.dishes.map((dish, dIdx) => (
                    <div key={dIdx} className="menu-item">
                      <div className="menu-item-content">
                        <div className="menu-item-header">
                          <div className="menu-item-names">
                            <span className="menu-item-translated">{dish.translatedName}</span>
                            <span className="menu-item-original">{dish.originalName}</span>
                          </div>
                          {dish.price && <span className="menu-item-price">{dish.price}</span>}
                        </div>
                        {dish.description && (
                          <p className="menu-item-description">{dish.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Footer */}
            <div className="menu-footer">
              <p>Translated by <span className="gradient-text">menumenu</span></p>
            </div>
          </div>
          </div>{/* /captureRef */}
        </div>
      )}
    </main>
  );
}
