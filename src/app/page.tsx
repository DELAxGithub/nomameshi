"use client";

import { useState } from "react";

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

export default function Home() {
  const [analyzing, setAnalyzing] = useState(false);
  const [menu, setMenu] = useState<MenuResult | null>(null);
  const [heroImage, setHeroImage] = useState<string | null>(null);
  const [heroLoading, setHeroLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        body: JSON.stringify({ image: dataUrl }),
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

  const resizeImage = (dataUrl: string, maxWidth = 1600): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        if (img.width <= maxWidth) { resolve(dataUrl); return; }
        const scale = maxWidth / img.width;
        const canvas = document.createElement("canvas");
        canvas.width = maxWidth;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.8));
      };
      img.src = dataUrl;
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });
    const resized = await resizeImage(dataUrl);
    await analyzeImage(resized);
  };

  const handlePaste = async () => {
    try {
      const items = await navigator.clipboard.read();
      for (const item of items) {
        const imageType = item.types.find(t => t.startsWith("image/"));
        if (imageType) {
          const blob = await item.getType(imageType);
          const dataUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = () => reject(new Error("Failed to read clipboard image"));
            reader.readAsDataURL(blob);
          });
          const resized = await resizeImage(dataUrl);
          await analyzeImage(resized);
          return;
        }
      }
      setError("No image found in clipboard.");
    } catch {
      setError("Clipboard access denied. Please use the upload button.");
    }
  };

  const handlePrint = () => {
    window.print();
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
            <button onClick={handlePrint} style={{
              background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: "8px", color: "var(--foreground-muted)", cursor: "pointer",
              padding: "6px 14px", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "6px"
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                <rect x="6" y="14" width="12" height="8" />
              </svg>
              Save PDF
            </button>
          </div>

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
        </div>
      )}
    </main>
  );
}
