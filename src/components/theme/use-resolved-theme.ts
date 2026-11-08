"use client";

import { useSyncExternalStore } from "react";
import { useUiStore } from "@/stores/ui-store";

const query = "(prefers-color-scheme: dark)";

function subscribe(callback: () => void) {
  const media = window.matchMedia(query);
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}

/** The theme actually shown, with "system" resolved against the OS setting. */
export function useResolvedTheme(): "light" | "dark" {
  const theme = useUiStore((s) => s.theme);
  const systemDark = useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
  if (theme === "system") return systemDark ? "dark" : "light";
  return theme;
}
