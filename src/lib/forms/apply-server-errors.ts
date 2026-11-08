import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import { ApiClientError } from "@/lib/api/client";

/**
 * Shows server-side field errors (422 validation, 409 unique conflicts) on the
 * matching form fields. Returns true when at least one field error was set, so
 * the caller only needs a toast for errors that are not about a field.
 */
export function applyServerErrors<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
): boolean {
  if (!(error instanceof ApiClientError) || !error.fieldErrors) return false;
  let applied = false;
  for (const [field, messages] of Object.entries(error.fieldErrors)) {
    const message = messages?.[0];
    if (!message) continue;
    setError(field as Path<T>, { type: "server", message }, { shouldFocus: !applied });
    applied = true;
  }
  return applied;
}
