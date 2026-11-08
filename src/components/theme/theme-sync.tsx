"use client";

import { useEffect } from "react";
import { useResolvedTheme } from "./use-resolved-theme";

/** Keeps the `dark` class on <html> in sync with the store after hydration. */
export function ThemeSync() {
  const resolved = useResolvedTheme();
  useEffect(() => {
    document.documentElement.classList.toggle("dark", resolved === "dark");
  }, [resolved]);
  return null;
}
