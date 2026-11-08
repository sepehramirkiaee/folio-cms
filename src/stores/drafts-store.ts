import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type Draft = { values: unknown; savedAt: number };

type DraftsState = {
  drafts: Record<string, Draft>;
  saveDraft: (key: string, values: unknown) => void;
  clearDraft: (key: string) => void;
};

/** Drafts older than this are dropped on load. */
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Unsaved form input, kept in localStorage so a reload, a closed tab or an
 * expired session does not lose a half-written project description. This is
 * UI state about the form, not server data: it is cleared on a successful save.
 */
export const useDraftsStore = create<DraftsState>()(
  persist(
    (set) => ({
      drafts: {},
      saveDraft: (key, values) =>
        set((s) => ({ drafts: { ...s.drafts, [key]: { values, savedAt: Date.now() } } })),
      clearDraft: (key) =>
        set((s) => ({
          drafts: Object.fromEntries(Object.entries(s.drafts).filter(([k]) => k !== key)),
        })),
    }),
    {
      name: "folio-drafts",
      storage: createJSONStorage(() => localStorage),
      merge: (persisted, current) => {
        const drafts = (persisted as Partial<DraftsState> | undefined)?.drafts ?? {};
        const fresh = Object.fromEntries(
          Object.entries(drafts).filter(([, d]) => Date.now() - d.savedAt < MAX_AGE_MS),
        );
        return { ...current, drafts: fresh };
      },
    },
  ),
);
