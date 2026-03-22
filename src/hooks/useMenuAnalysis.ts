"use client";

import { useState } from "react";
import {
  analyzeMenuImage,
  generateTableImage as generateTableImageService,
} from "@/lib/api-client";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { isNative } from "@/lib/platform";
import { blobToDataUrl } from "@/lib/image-utils";
import type { MenuResult, Section } from "@/types/menu";

export function useMenuAnalysis(targetLang: string, selectedRegion: string) {
  const [analyzing, setAnalyzing] = useState(false);
  const [menu, setMenu] = useState<MenuResult | null>(null);
  const [heroImage, setHeroImage] = useState<string | null>(null);
  const [heroLoading, setHeroLoading] = useState(false);
  const [heroError, setHeroError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [detectedCountry, setDetectedCountry] = useState<string | null>(null);

  const generateTableImage = async (sections: Section[]) => {
    setHeroLoading(true);
    setHeroError(null);
    try {
      const allDishes = sections.flatMap((s) =>
        s.dishes.map((d) => d.imageQuery)
      );
      const imageUrl = await generateTableImageService(allDishes);
      if (imageUrl) {
        setHeroImage(imageUrl);
      } else {
        setHeroError("Failed to generate image.");
      }
    } catch (err) {
      console.error("Table image generation failed:", err);
      setHeroError("Failed to generate image.");
    } finally {
      setHeroLoading(false);
    }
  };

  const analyzeImage = async (dataUrl: string) => {
    setAnalyzing(true);
    setMenu(null);
    setHeroImage(null);
    setHeroError(null);
    setError(null);
    setDetectedCountry(selectedRegion === "auto" ? null : selectedRegion);

    if (!navigator.onLine) {
      setError("Internet connection lost. Please check your signal.");
      setAnalyzing(false);
      return;
    }

    let fullText = "";

    try {
      let countryFound = false;

      for await (const chunk of analyzeMenuImage(
        dataUrl,
        targetLang,
        selectedRegion
      )) {
        fullText += chunk;

        if (!countryFound) {
          const match = fullText.match(
            /"detected_country_code"\s*:\s*"([A-Z]{2})"/
          );
          if (match) {
            setDetectedCountry(match[1]);
            countryFound = true;
          }
        }
      }

      const cleanedText = fullText
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();
      let data;
      try {
        data = JSON.parse(cleanedText);
      } catch (parseError) {
        console.warn(
          "JSON Parse Error. Attempting to repair truncated JSON..."
        );
        try {
          let fixedText = cleanedText;
          if (fixedText.endsWith(",")) fixedText = fixedText.slice(0, -1);
          if (fixedText.endsWith(":")) fixedText += '""';

          let inString = false;
          let escapeNext = false;
          const stack: string[] = [];

          for (let i = 0; i < fixedText.length; i++) {
            const char = fixedText[i];
            if (escapeNext) {
              escapeNext = false;
              continue;
            }
            if (char === "\\") {
              escapeNext = true;
              continue;
            }
            if (char === '"') {
              inString = !inString;
              continue;
            }
            if (!inString) {
              if (char === "{") stack.push("}");
              else if (char === "[") stack.push("]");
              else if (char === "}" || char === "]") stack.pop();
            }
          }

          if (inString) fixedText += '"';
          while (stack.length > 0) {
            fixedText += stack.pop();
          }

          data = JSON.parse(fixedText);
          console.log("Successfully repaired truncated JSON.");
        } catch {
          throw parseError;
        }
      }

      let menuData: MenuResult;

      if (data.sections) {
        menuData = data;
      } else if (data.dishes) {
        menuData = {
          restaurantName: data.restaurantName || null,
          restaurantVibe: data.restaurant_vibe || "",
          sections: [
            {
              originalTitle: "MENU",
              translatedTitle: "メニュー",
              dishes: data.dishes,
            },
          ],
        };
      } else {
        throw new Error("No menu data found");
      }

      setMenu(menuData);
      generateTableImage(menuData.sections);
    } catch (err: unknown) {
      console.error("Failed to analyze", err);
      const errMsg =
        err instanceof Error ? err.message : "Analysis failed. Please try again.";

      let msg = errMsg;
      if (errMsg.includes("Failed to fetch")) {
        if (!fullText) {
          msg = "Internet connection lost. Please check your signal.";
        } else {
          msg = "Connection lost, but showing partial results.";
        }
      }

      if (!fullText && !menu) {
        setError(msg);
      } else if (!menu) {
        setError(`Could not generate menu structure. ${msg}`);
      }
    } finally {
      setAnalyzing(false);
      setDetectedCountry(null);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await blobToDataUrl(file);
    await analyzeImage(dataUrl);
  };

  const handleScan = async () => {
    if (analyzing) return;
    if (isNative()) {
      try {
        const photo = await Camera.getPhoto({
          quality: 80,
          allowEditing: false,
          resultType: CameraResultType.DataUrl,
          source: CameraSource.Prompt,
          width: 1280,
          height: 1280,
        });
        if (photo.dataUrl) {
          await analyzeImage(photo.dataUrl);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        if (msg.toLowerCase().includes("cancel")) return;
        console.error("Camera error:", msg);
        alert("Camera error: " + msg);
      }
    } else {
      document.getElementById("menu-upload")?.click();
    }
  };

  const handlePaste = async () => {
    try {
      const items = await navigator.clipboard.read();
      for (const item of items) {
        const imageType = item.types.find((t) => t.startsWith("image/"));
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

  const resetMenu = () => {
    setMenu(null);
    setHeroImage(null);
  };

  const loadMenu = (menuData: MenuResult) => {
    setMenu(menuData);
    setHeroImage(null);
    setHeroError(null);
    setError(null);
  };

  return {
    analyzing,
    menu,
    heroImage,
    heroLoading,
    heroError,
    error,
    detectedCountry,
    handleScan,
    handleFileUpload,
    handlePaste,
    resetMenu,
    loadMenu,
    retryHeroImage: () => menu && generateTableImage(menu.sections),
  };
}
