"use client";

import { useState, useEffect, useRef } from "react";
import { CULTURAL_TIPS } from "@/data/cultural-tips";
import { REGIONS, REGION_FLAGS } from "@/data/constants";

export function useCulturalTips(
  selectedRegion: string,
  targetLang: string,
  analyzing: boolean,
  detectedCountry: string | null
) {
  const [tipIndex, setTipIndex] = useState(0);
  const [shuffledTipIndices, setShuffledTipIndices] = useState<number[]>([]);
  const tipTouchStartX = useRef<number | null>(null);

  const getResolvedCountry = () => {
    if (analyzing && detectedCountry) return detectedCountry;
    return selectedRegion === "auto" ? null : selectedRegion;
  };

  // Shuffle tip indices when region or language changes
  useEffect(() => {
    const country = getResolvedCountry();
    const defaultCountry = "default";
    const tipObj =
      CULTURAL_TIPS[country || defaultCountry] ||
      CULTURAL_TIPS[defaultCountry];
    const tipsArray = tipObj[targetLang] || tipObj["English"];
    // Fisher-Yates shuffle
    const indices = Array.from({ length: tipsArray.length }, (_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    setShuffledTipIndices(indices);
    setTipIndex(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRegion, targetLang, detectedCountry]);

  // Rotation logic
  const shouldRotateTips = analyzing || selectedRegion !== "auto";
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (shouldRotateTips) {
      interval = setInterval(() => {
        setTipIndex((prev) => prev + 1);
      }, 8000);
    }
    return () => clearInterval(interval);
  }, [shouldRotateTips, tipIndex]);

  const goNextTip = () => setTipIndex((prev) => prev + 1);
  const goPrevTip = () => {
    const len = shuffledTipIndices.length || 1;
    setTipIndex((prev) => (((prev % len) - 1 + len) % len));
  };

  const handleTipTouchStart = (e: React.TouchEvent) => {
    tipTouchStartX.current = e.touches[0].clientX;
  };

  const handleTipTouchEnd = (e: React.TouchEvent) => {
    if (tipTouchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - tipTouchStartX.current;
    tipTouchStartX.current = null;
    if (Math.abs(delta) < 40) return;
    if (delta < 0) goNextTip();
    else goPrevTip();
  };

  const getTipText = (countryCode: string | null) => {
    const defaultCountry = "default";
    const tipObj =
      CULTURAL_TIPS[countryCode || defaultCountry] ||
      CULTURAL_TIPS[defaultCountry];
    const tipsArray = tipObj[targetLang] || tipObj["English"];
    if (shuffledTipIndices.length === 0) return tipsArray[0];
    const idx = shuffledTipIndices[tipIndex % shuffledTipIndices.length];
    return tipsArray[idx];
  };

  // Resolved display info
  const resolvedCountry = getResolvedCountry();
  const tipCountryFlag = resolvedCountry ? REGION_FLAGS[resolvedCountry] : undefined;
  const tipCountryLabel = resolvedCountry
    ? REGIONS.find((r) => r.code === resolvedCountry)?.label || resolvedCountry
    : undefined;

  return {
    tipIndex,
    goNextTip,
    goPrevTip,
    handleTipTouchStart,
    handleTipTouchEnd,
    getTipText,
    tipCountryFlag,
    tipCountryLabel,
  };
}
