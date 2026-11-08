import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type ThemePreference = "light" | "dark" | "system";

/** localStorage key, also read by the inline no-flash script in the root layout. */
export const UI_STORE_KEY = "folio-ui";

type UiState = {
  theme: ThemePreference;
  sidebarCollapsed: boolean;
  mobileNavOpen: boolean;
  projectsTab: "list" | "order";
  setTheme: (theme: ThemePreference) => void;
  toggleSidebar: () => void;
  setMobileNavOpen: (open: boolean) => void;
  setProjectsTab: (tab: "list" | "order") => void;
};

/**
 * UI-only state. Server data never lives here; that is TanStack Query's job.
 * Only user preferences are persisted, transient state (mobile nav) is not.
 */
export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      theme: "system",
      sidebarCollapsed: false,
      mobileNavOpen: false,
      projectsTab: "list",
      setTheme: (theme) => set({ theme }),
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setMobileNavOpen: (mobileNavOpen) => set({ mobileNavOpen }),
      setProjectsTab: (projectsTab) => set({ projectsTab }),
    }),
    {
      name: UI_STORE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        theme: s.theme,
        sidebarCollapsed: s.sidebarCollapsed,
        projectsTab: s.projectsTab,
      }),
    },
  ),
);
