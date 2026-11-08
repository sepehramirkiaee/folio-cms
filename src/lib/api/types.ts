// Shapes shared by route handlers and the client fetcher.

export type ApiErrorCode =
  | "UNAUTHORIZED"
  | "NOT_FOUND"
  | "VALIDATION_ERROR"
  | "CONFLICT"
  | "DEMO_PROTECTED"
  | "BAD_REQUEST"
  | "RATE_LIMITED"
  | "INTERNAL";

export type FieldErrors = Record<string, string[] | undefined>;

export type ApiErrorBody = {
  error: { code: ApiErrorCode; message: string; fieldErrors?: FieldErrors };
};

export type ApiSuccessBody<T> = { data: T };

export type Paginated<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
};
