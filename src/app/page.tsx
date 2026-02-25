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

const REGIONS = [
  { code: "auto", label: "Auto-Detect" },
  { code: "JP", label: "Japan" },
  { code: "IT", label: "Italy" },
  { code: "ES", label: "Spain" },
  { code: "FR", label: "France" },
  { code: "US", label: "USA" },
  { code: "KR", label: "Korea" },
  { code: "TH", label: "Thailand" },
  { code: "TW", label: "Taiwan" }
];

const CULTURAL_TIPS: Record<string, Record<string, string>> = {
  "JP": {
    "Japanese": "💡 豆知識: 日本ではお通し（席料）がかかる居酒屋が多く、チップの習慣はありません。",
    "English": "💡 Tip: Tipping is not customary in Japan and might even be politely refused.",
    "Chinese": "💡 提示：在日本，居酒屋通常会收取“小菜费”（座席费），而且没有付小费的习惯。",
    "Korean": "💡 팁: 일본에서는 팁 문화가 없으며, 정중히 거절당할 수도 있습니다.",
    "Spanish": "💡 Consejo: No se acostumbra dejar propina en Japón.",
    "French": "💡 Astuce: Le pourboire n'est pas coutumier au Japon."
  },
  "IT": {
    "Japanese": "💡 豆知識: イタリアではコペルト（席料兼パン代）が必須の店が多く、チップは基本的に自由です。",
    "English": "💡 Tip: Coperto (cover charge) is mandatory in Italy, tipping is mostly optional.",
    "Chinese": "💡 提示：在意大利，Coperto（座位费和面包费）通常是强制收取的，小费则随客意。",
    "Korean": "💡 팁: 이탈리아에서는 코페르토(자릿세)가 필수인 곳이 많으며, 팁은 대체로 선택 사항입니다.",
    "Spanish": "💡 Consejo: El Coperto es un cargo de mesa obligatorio en Italia, la propina es opcional.",
    "French": "💡 Astuce: Le Coperto est obligatoire en Italie, le pourboire est optionnel."
  },
  "ES": {
    "Japanese": "💡 豆知識: アンダルシア地方などでは、ドリンクを頼むと無料のタパスが付いてくることがあります！",
    "English": "💡 Tip: Tapas are often free with drinks in parts of Andalusia!",
    "Chinese": "💡 提示：在安达卢西亚等地区，点饮料通常会免费赠送塔帕斯（Tapas）小吃！",
    "Korean": "💡 팁: 안달루시아 등 일부 지역에서는 음료를 주문하면 무료 타파스가 나오는 경우가 있습니다!",
    "Spanish": "💡 Consejo: ¡Las tapas suelen ser gratis con las bebidas en partes de Andalucía!",
    "French": "💡 Astuce: Les tapas sont souvent accompagnées de boissons en Andalousie !"
  },
  "FR": {
    "Japanese": "💡 豆知識: フランスはサービス料込み（service compris）ですが、小銭を置いていくのがスマートです。",
    "English": "💡 Tip: Service is usually included (service compris), but leaving a few coins is polite.",
    "Chinese": "💡 提示：法国账单通常已含服务费（service compris），但留下几枚硬币作为小费被认为是礼貌的做法。",
    "Korean": "💡 팁: 프랑스에서는 서비스 요금이 포함되어 있지만(service compris), 잔돈을 남겨두는 것이 예의입니다.",
    "Spanish": "💡 Consejo: El servicio suele estar incluido en Francia, pero dejar algunas monedas es de buena educación.",
    "French": "💡 Astuce: Le service est compris, mais laisser quelques pièces est poli."
  },
  "US": {
    "Japanese": "💡 豆知識: アメリカの標準的なチップ相場は現在 18% 〜 25% 程度となっています。",
    "English": "💡 Tip: Standard tipping in the US is currently 18% - 25%.",
    "Chinese": "💡 提示：目前美国的标准小费比例大约在 18% 到 25% 之间。",
    "Korean": "💡 팁: 현재 미국의 일반적인 팁 비율은 18% ~ 25% 정도입니다.",
    "Spanish": "💡 Consejo: La propina estándar en EE.UU. actualmente es del 18% al 25%.",
    "French": "💡 Astuce: Le pourboire standard aux États-Unis est actuellement de 18% à 25%."
  },
  "KR": {
    "Japanese": "💡 豆知識: 韓国のレストランでは「パンチャン（おかず）」は無料でおかわり自由な店がほとんどです！",
    "English": "💡 Tip: Banchan (side dishes) are free and refillable in most Korean restaurants!",
    "Chinese": "💡 提示：在韩国餐厅，Banchan（配菜）通常是免费且可以无限续加的！",
    "Korean": "💡 팁: 대부분의 한국 식당에서 반찬은 무료이며 리필이 가능합니다!",
    "Spanish": "💡 Consejo: ¡Los Banchan (guarniciones) son gratis y rellenables en Corea!",
    "French": "💡 Astuce: Les Banchan (plats d'accompagnement) sont gratuits et à volonté en Corée !"
  },
  "TH": {
    "Japanese": "💡 豆知識: タイではスプーンを右手に持ち、フォークはスプーンにご飯を寄せるために使います。",
    "English": "💡 Tip: In Thailand, you typically eat with a spoon and use the fork only to push food onto the spoon.",
    "Chinese": "💡 提示：在泰国，通常用右手拿勺子，叉子仅用来将食物推到勺子里。",
    "Korean": "💡 팁: 태국에서는 주로 숟가락으로 식사하며, 포크는 음식을 숟가락으로 모으는 데만 사용합니다.",
    "Spanish": "💡 Consejo: En Tailandia, la cuchara se usa para comer y el tenedor para empujar la comida.",
    "French": "💡 Astuce: En Thaïlande, mangez avec la cuillère, la fourchette sert à pousser la nourriture."
  },
  "TW": {
    "Japanese": "💡 豆知識: 台湾の屋台や夜市では、食べ歩きよりもその場の小さなテーブルでサッと食べるのが主流です。",
    "English": "💡 Tip: In Taiwanese night markets, it's common to eat quickly at the small tables provided rather than walking around.",
    "Chinese": "💡 提示：在台湾夜市，人们通常习惯在摊位旁的小桌子上迅速吃完，而不是边走边吃。",
    "Korean": "💡 팁: 대만 야시장에서는 돌아다니며 먹기보다 제공된 작은 테이블에서 빨리 먹는 것이 일반적입니다.",
    "Spanish": "💡 Consejo: En los mercados nocturnos de Taiwán, es común comer rápido en mesas pequeñas.",
    "French": "💡 Astuce: Sur les marchés de nuit taïwanais, mangez rapidement aux petites tables prévues à cet effet."
  },
  "default": {
    "Japanese": "💡 豆知識: 現地の食文化を知ることは、旅を何倍も豊かにしてくれます！",
    "English": "💡 Tip: Exploring local flavors is the best way to understand a new culture.",
    "Chinese": "💡 提示：探索地道美食是了解新文化最好的方式。",
    "Korean": "💡 팁: 현지의 맛을 즐기는 것은 새로운 문화를 이해하는 가장 좋은 방법입니다!",
    "Spanish": "💡 Consejo: Explorar los sabores locales es la mejor forma de entender una nueva cultura.",
    "French": "💡 Astuce: Explorer les saveurs locales est la meilleure façon de comprendre une culture."
  }
};

export default function Home() {
  const [analyzing, setAnalyzing] = useState(false);
  const [menu, setMenu] = useState<MenuResult | null>(null);
  const [heroImage, setHeroImage] = useState<string | null>(null);
  const [heroLoading, setHeroLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [targetLang, setTargetLang] = useState("Japanese");
  const [selectedRegion, setSelectedRegion] = useState("auto");
  const [detectedCountry, setDetectedCountry] = useState<string | null>(null);

  // Determine the tip language based on the targetLang code
  const getTipText = (countryCode: string | null) => {
    const defaultCountry = "default";
    const tipObj = CULTURAL_TIPS[countryCode || defaultCountry] || CULTURAL_TIPS[defaultCountry];
    return tipObj[targetLang] || tipObj["English"];
  };

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
    setDetectedCountry(selectedRegion === "auto" ? null : selectedRegion);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: dataUrl, targetLang, selectedRegion }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("API Error:", errorText);
        throw new Error(`Analysis failed: ${res.status}`);
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("Stream not supported");

      const decoder = new TextDecoder("utf-8");
      let fullText = "";
      let countryFound = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        fullText += chunk;

        if (!countryFound) {
          const match = fullText.match(/"detected_country_code"\s*:\s*"([A-Z]{2})"/);
          if (match) {
            setDetectedCountry(match[1]);
            countryFound = true;
          }
        }
      }

      // Final JSON parse after stream finishes
      const cleanedText = fullText.replace(/```json/g, "").replace(/```/g, "").trim();
      const data = JSON.parse(cleanedText);

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
      setDetectedCountry(null);
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

          {/* Region selector */}
          <div style={{ marginTop: "2rem" }}>
            <p style={{ fontSize: "0.8rem", color: "var(--foreground-muted)", marginBottom: "0.5rem" }}>Where are you eating?</p>
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "6px" }}>
              {REGIONS.map(region => (
                <button key={region.code} onClick={() => setSelectedRegion(region.code)} disabled={analyzing} style={{
                  padding: "6px 14px", borderRadius: "20px", fontSize: "0.8rem", cursor: "pointer",
                  border: selectedRegion === region.code ? "1px solid var(--primary)" : "1px solid rgba(255,255,255,0.12)",
                  background: selectedRegion === region.code ? "rgba(255,75,43,0.15)" : "rgba(255,255,255,0.04)",
                  color: selectedRegion === region.code ? "var(--primary)" : "var(--foreground-muted)",
                  opacity: analyzing ? 0.5 : 1,
                }}>
                  {region.label}
                </button>
              ))}
            </div>
          </div>

          {/* Language selector */}
          <div style={{ marginTop: "1.5rem" }}>
            <p style={{ fontSize: "0.8rem", color: "var(--foreground-muted)", marginBottom: "0.5rem" }}>Translate menu into</p>
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "6px" }}>
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
          </div>

          {analyzing ? (
            <div className="animate-fade-in" style={{ marginTop: "1.5rem", padding: "1rem", background: "rgba(255,255,255,0.02)", borderRadius: "12px", border: "1px dashed rgba(255,255,255,0.1)" }}>
              <p style={{ fontSize: "0.75rem", color: "var(--primary)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.5rem" }}>
                {detectedCountry ? `Detected Region: ${detectedCountry}` : "Detecting Region..."}
              </p>
              <p style={{ fontSize: "0.9rem", color: "var(--foreground)", lineHeight: "1.4", fontStyle: "italic" }}>
                {getTipText(detectedCountry)}
              </p>
            </div>
          ) : (
            <p style={{ marginTop: "1rem", fontSize: "0.8rem", color: "#666" }}>
              Take a photo or paste a screenshot.
            </p>
          )}
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
                <div className="menu-hero-loading skeleton" style={{ height: "40vh", width: "100%", borderRadius: "var(--radius-md)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "pulse 2s infinite" }}>
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                    <polyline points="21 15 16 10 5 21"></polyline>
                  </svg>
                  <p style={{ marginTop: "1rem", color: "rgba(255,255,255,0.4)", fontSize: "0.9rem", letterSpacing: "0.05em" }}>
                    Generating table spread...
                  </p>
                </div>
              ) : heroImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={heroImage} alt="Table spread" className="menu-hero-img animate-fade-in" />
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
