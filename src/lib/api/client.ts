import type { ApiErrorBody, ApiErrorCode, FieldErrors } from "./types";

/** Error thrown by apiFetch for any non-2xx response. */
export class ApiClientError extends Error {
  readonly status: number;
  readonly code: ApiErrorCode;
  readonly fieldErrors?: FieldErrors;

  constructor(status: number, body: ApiErrorBody["error"]) {
    super(body.message);
    this.name = "ApiClientError";
    this.status = status;
    this.code = body.code;
    this.fieldErrors = body.fieldErrors;
  }
}

type JsonInit = Omit<RequestInit, "body"> & { json?: unknown };

/**
 * Typed fetch for the admin API. Unwraps `{ data }`, throws ApiClientError for
 * `{ error }`, and returns undefined for 204 responses.
 */
export async function apiFetch<T>(
  path: string,
  { json, headers, ...init }: JsonInit = {},
): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(json !== undefined && { "Content-Type": "application/json" }),
      ...headers,
    },
    body: json !== undefined ? JSON.stringify(json) : undefined,
  });

  if (response.status === 204) return undefined as T;

  const body = (await response.json().catch(() => null)) as { data: T } | ApiErrorBody | null;

  if (!response.ok || !body || "error" in body) {
    const error =
      body && "error" in body
        ? body.error
        : { code: "INTERNAL" as const, message: `Request failed (${response.status})` };
    throw new ApiClientError(response.status, error);
  }
  return body.data;
}
