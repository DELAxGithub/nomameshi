"use client";

import { useState, useEffect, useCallback } from "react";
import type { MenuResult, SavedMenu } from "@/types/menu";

const STORAGE_KEY = "nomameshi_history";
const MAX_ITEMS = 20;

function loadFromStorage(): SavedMenu[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as SavedMenu[];
  } catch {
    return [];
  }
}

function saveToStorage(items: SavedMenu[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {}
}

export function useHistory() {
  const [history, setHistory] = useState<SavedMenu[]>([]);

  useEffect(() => {
    // localStorage is only available post-hydration; lazy useState init would
    // cause SSR/CSR mismatch on the server-rendered empty array.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHistory(loadFromStorage());
  }, []);

  const saveMenu = useCallback(
    (menu: MenuResult, regionCode: string, targetLang: string) => {
      setHistory((prev) => {
        // Deduplicate: same restaurant name + same number of sections = same menu
        const isDuplicate = prev.some(
          (item) =>
            item.menu.restaurantName === menu.restaurantName &&
            item.menu.sections.length === menu.sections.length
        );
        if (isDuplicate) return prev;

        const entry: SavedMenu = {
          id: crypto.randomUUID(),
          savedAt: Date.now(),
          regionCode,
          targetLang,
          menu,
        };

        const updated = [entry, ...prev].slice(0, MAX_ITEMS);
        saveToStorage(updated);
        return updated;
      });
    },
    []
  );

  const deleteMenu = useCallback((id: string) => {
    setHistory((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      saveToStorage(updated);
      return updated;
    });
  }, []);

  return { history, saveMenu, deleteMenu };
}
