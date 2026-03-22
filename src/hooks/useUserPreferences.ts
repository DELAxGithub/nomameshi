"use client";

import { useState, useEffect } from "react";
import { REGIONS, LANGUAGES } from "@/data/constants";
import { StatusBar, Style } from "@capacitor/status-bar";
import { isNative } from "@/lib/platform";

export function useUserPreferences() {
  const [targetLang, setTargetLang] = useState("Japanese");
  const [selectedRegion, setSelectedRegion] = useState("auto");

  useEffect(() => {
    try {
      const savedRegion = localStorage.getItem("nomameshi_region");
      const savedLang = localStorage.getItem("nomameshi_lang");
      if (savedRegion && REGIONS.some((r) => r.code === savedRegion))
        setSelectedRegion(savedRegion);
      if (savedLang && LANGUAGES.some((l) => l.code === savedLang))
        setTargetLang(savedLang);
    } catch {}
    if (isNative()) {
      StatusBar.setStyle({ style: Style.Light }).catch(() => {});
    }
  }, []);

  const updateRegion = (code: string) => {
    setSelectedRegion(code);
    try {
      localStorage.setItem("nomameshi_region", code);
    } catch {}
  };

  const updateLang = (code: string) => {
    setTargetLang(code);
    try {
      localStorage.setItem("nomameshi_lang", code);
    } catch {}
  };

  return {
    targetLang,
    selectedRegion,
    setTargetLang: updateLang,
    setSelectedRegion: updateRegion,
  };
}
