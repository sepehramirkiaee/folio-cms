import "server-only";
import type { Session } from "next-auth";
import { z } from "zod";
import { getAdminSession } from "@/features/auth/server/session";
import { Prisma } from "@/generated/prisma/client";
import { ApiError } from "./errors";
import type { ApiErrorBody } from "./types";

function errorResponse(error: ApiError): Response {
  const body: ApiErrorBody = {
    error: { code: error.code, message: error.message, fieldErrors: error.fieldErrors },
  };
  return Response.json(body, { status: error.status });
}

/** Maps known errors to API errors. Anything else is logged and hidden. */
function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;
  if (error instanceof z.ZodError) {
    return new ApiError(
      "VALIDATION_ERROR",
      "Some fields are invalid",
      z.flattenError(error).fieldErrors as Record<string, string[]>,
    );
  }
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      const fields = uniqueFields(error);
      return new ApiError(
        "CONFLICT",
        "That value is already in use",
        Object.fromEntries(fields.map((f) => [f, ["Already in use"]])),
      );
    }
    if (error.code === "P2025") return ApiError.notFound();
  }
  console.error(error);
  return new ApiError("INTERNAL", "Something went wrong");
}

function uniqueFields(error: Prisma.PrismaClientKnownRequestError): string[] {
  const target = error.meta?.target;
  if (Array.isArray(target)) return target.map(String);
  // With driver adapters the field list is nested in the adapter error.
  const fields = (
    error.meta as { driverAdapterError?: { cause?: { constraint?: { fields?: string[] } } } }
  )?.driverAdapterError?.cause?.constraint?.fields;
  return fields?.map((f) => f.replaceAll('"', "")) ?? [];
}

type Handler<C> = (request: Request, context: C) => Promise<unknown>;
type AdminHandler<C> = (request: Request, context: C, session: Session) => Promise<unknown>;

/**
 * Turns a handler's return value into `{ data }` (or 204 for undefined), and
 * thrown errors into `{ error }` with the right status code.
 */
export function withErrors<C>(handler: Handler<C>) {
  return async (request: Request, context: C): Promise<Response> => {
    try {
      const result = await handler(request, context);
      if (result instanceof Response) return result;
      if (result === undefined) return new Response(null, { status: 204 });
      return Response.json({ data: result });
    } catch (error) {
      return errorResponse(toApiError(error));
    }
  };
}

/**
 * Wraps an admin route handler: checks the session (proxy.ts is only the
 * first check), then behaves like withErrors.
 */
export function withAdmin<C>(handler: AdminHandler<C>) {
  return withErrors<C>(async (request, context) => {
    const session = await getAdminSession();
    if (!session) throw new ApiError("UNAUTHORIZED", "Sign in to continue");
    return handler(request, context, session);
  });
}

/** Parses a JSON body with a Zod schema. Bad JSON is a 400, bad fields a 422. */
export async function parseBody<S extends z.ZodType>(
  request: Request,
  schema: S,
): Promise<z.infer<S>> {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    throw new ApiError("BAD_REQUEST", "Request body must be valid JSON");
  }
  return schema.parse(json);
}

/** Parses URL search params with a Zod schema. */
export function parseQuery<S extends z.ZodType>(request: Request, schema: S): z.infer<S> {
  const params = Object.fromEntries(new URL(request.url).searchParams);
  const result = schema.safeParse(params);
  if (!result.success) throw new ApiError("BAD_REQUEST", "Invalid query parameters");
  return result.data;
}
