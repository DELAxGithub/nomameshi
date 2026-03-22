"use client";

import { useState, useRef } from "react";
import html2canvas from "html2canvas";
import { Share as CapShare } from "@capacitor/share";
import { isNative } from "@/lib/platform";
import type { MenuResult } from "@/types/menu";

export function useMenuExport(menu: MenuResult | null) {
  const captureRef = useRef<HTMLDivElement>(null);
  const [saving, setSaving] = useState(false);

  const handleSaveImage = async () => {
    if (!captureRef.current) return;
    setSaving(true);
    try {
      const canvas = await html2canvas(captureRef.current, {
        backgroundColor: "#1E2432",
        scale: 2,
        useCORS: true,
      });
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const fileName = `Nomameshi-${menu?.restaurantName?.replace(/\s+/g, "-") || "menu"}.png`;
        const file = new File([blob], fileName, { type: "image/png" });

        if (navigator.share && navigator.canShare?.({ files: [file] })) {
          try {
            await navigator.share({ files: [file] });
          } catch {
            /* user cancelled */
          }
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
      lines.push(
        `── ${section.translatedTitle} (${section.originalTitle}) ──`
      );
      for (const dish of section.dishes) {
        const price = dish.price ? `  ${dish.price}` : "";
        lines.push(`${dish.translatedName} / ${dish.originalName}${price}`);
        if (dish.description) lines.push(`  ${dish.description}`);
      }
      lines.push("");
    }
    lines.push("Translated by Nomameshi\nhttps://menumenu-three.vercel.app");
    const text = lines.join("\n");

    if (isNative()) {
      try {
        await CapShare.share({ title: "Nomameshi", text });
      } catch {
        /* user cancelled */
      }
    } else if (navigator.share) {
      try {
        await navigator.share({ title: "Nomameshi", text });
      } catch {
        /* user cancelled */
      }
    } else {
      await navigator.clipboard.writeText(text);
      alert("Copied to clipboard!");
    }
  };

  return { captureRef, saving, handleSaveImage, handleShare };
}
