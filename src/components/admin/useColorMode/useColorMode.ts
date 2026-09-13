"use client";

import { useCallback, useEffect, useState } from "react";

export type ColorMode = "light" | "dark" | "system";

const STORAGE_KEY = "admin-color-mode";

const readStoredMode = (): ColorMode => {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    if (value === "light" || value === "dark" || value === "system") return value;
  } catch {
    /* 隐私模式下 localStorage 可能不可用，忽略 */
  }

  return "system";
};

/**
 * 主题切换：把选择写进 localStorage 并同步到 <html data-theme>。
 * 首屏由 layout 里的阻塞脚本决定，避免刷新时闪一下白底。
 */
export const useColorMode = () => {
  const [mode, setMode] = useState<ColorMode>("system");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMode(readStoredMode());
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const apply = () => {
      const resolved = mode === "system" ? (media.matches ? "dark" : "light") : mode;
      root.dataset.theme = resolved;
      root.dataset.colorMode = mode;
      root.style.colorScheme = resolved;
    };

    apply();

    try {
      window.localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      /* 忽略写入失败 */
    }

    if (mode !== "system") return;

    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [mode, mounted]);

  /** 亮 → 暗 → 跟随系统 → 亮 */
  const cycle = useCallback(() => {
    setMode((prev) => (prev === "light" ? "dark" : prev === "dark" ? "system" : "light"));
  }, []);

  return { mode, setMode, cycle, mounted };
};
