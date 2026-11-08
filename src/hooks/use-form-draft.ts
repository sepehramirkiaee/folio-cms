"use client";

import { useEffect, useRef, useState } from "react";
import { useFormState, type FieldValues, type UseFormReturn } from "react-hook-form";
import { useDraftsStore } from "@/stores/drafts-store";

/**
 * Autosaves dirty form values as a draft and offers to restore them later.
 *
 * The draft found on mount is captured once, so the restore prompt does not
 * disappear while the user keeps typing (which writes a newer draft).
 */
export function useFormDraft<T extends FieldValues>(form: UseFormReturn<T>, key: string) {
  const saveDraft = useDraftsStore((s) => s.saveDraft);
  const clearDraft = useDraftsStore((s) => s.clearDraft);
  const [pending, setPending] = useState(() => useDraftsStore.getState().drafts[key] ?? null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  // Subscribing here makes isDirty reliable even if the form never reads it.
  const { isDirty } = useFormState({ control: form.control });
  const dirty = useRef(isDirty);
  useEffect(() => {
    dirty.current = isDirty;
  }, [isDirty]);

  useEffect(() => {
    const subscription = form.watch((values) => {
      clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        if (dirty.current) saveDraft(key, values);
      }, 500);
    });
    return () => {
      subscription.unsubscribe();
      clearTimeout(timer.current);
    };
  }, [form, key, saveDraft]);

  return {
    /** When the pending draft was saved, or null if there is none to offer. */
    draftSavedAt: pending ? new Date(pending.savedAt) : null,
    restore: () => {
      if (!pending) return;
      form.reset(pending.values as T, { keepDefaultValues: true });
      setPending(null);
    },
    discard: () => {
      clearDraft(key);
      setPending(null);
    },
    /** Call after a successful save. */
    clear: () => {
      clearTimeout(timer.current);
      clearDraft(key);
      setPending(null);
    },
  };
}
