import type { ApiErrorCode, FieldErrors } from "./types";

const statusByCode: Record<ApiErrorCode, number> = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  CONFLICT: 409,
  DEMO_PROTECTED: 403,
  RATE_LIMITED: 429,
  VALIDATION_ERROR: 422,
  INTERNAL: 500,
};

/** Thrown from server modules and route handlers, turned into JSON by withAdmin. */
export class ApiError extends Error {
  readonly code: ApiErrorCode;
  readonly status: number;
  readonly fieldErrors?: FieldErrors;

  constructor(code: ApiErrorCode, message: string, fieldErrors?: FieldErrors) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = statusByCode[code];
    this.fieldErrors = fieldErrors;
  }

  static notFound(what = "Item") {
    return new ApiError("NOT_FOUND", `${what} not found`);
  }
}
