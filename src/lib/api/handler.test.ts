import { beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { ApiError } from "./errors";
import { parseBody, withAdmin } from "./handler";

const getAdminSession = vi.hoisted(() => vi.fn());
vi.mock("@/features/auth/server/session", () => ({ getAdminSession }));

const session = { user: { id: "u1", isDemo: false }, expires: "" };
const request = (body?: unknown) =>
  new Request("http://localhost/api/admin/x", {
    method: "POST",
    body: body === undefined ? undefined : typeof body === "string" ? body : JSON.stringify(body),
  });

describe("withAdmin", () => {
  beforeEach(() => getAdminSession.mockResolvedValue(session));

  it("returns 401 without a session and never calls the handler", async () => {
    getAdminSession.mockResolvedValue(null);
    const handler = vi.fn();
    const res = await withAdmin(handler)(request(), {});
    expect(res.status).toBe(401);
    expect(handler).not.toHaveBeenCalled();
  });

  it("wraps results in { data } and returns 204 for undefined", async () => {
    const ok = await withAdmin(async () => ({ id: 1 }))(request(), {});
    expect(await ok.json()).toEqual({ data: { id: 1 } });
    const empty = await withAdmin(async () => undefined)(request(), {});
    expect(empty.status).toBe(204);
  });

  it("maps ApiError and Zod errors to status codes", async () => {
    const notFound = await withAdmin(async () => {
      throw ApiError.notFound("Project");
    })(request(), {});
    expect(notFound.status).toBe(404);
    expect(await notFound.json()).toEqual({
      error: { code: "NOT_FOUND", message: "Project not found" },
    });

    const schema = z.object({ title: z.string().min(1, "Required") });
    const invalid = await withAdmin(async (req) => parseBody(req, schema))(
      request({ title: "" }),
      {},
    );
    expect(invalid.status).toBe(422);
    expect(await invalid.json()).toMatchObject({
      error: { code: "VALIDATION_ERROR", fieldErrors: { title: ["Required"] } },
    });
  });

  it("returns 400 for malformed JSON and hides unexpected errors", async () => {
    const schema = z.object({});
    const bad = await withAdmin(async (req) => parseBody(req, schema))(request("{nope"), {});
    expect(bad.status).toBe(400);

    vi.spyOn(console, "error").mockImplementation(() => {});
    const crash = await withAdmin(async () => {
      throw new Error("database password is hunter2");
    })(request(), {});
    expect(crash.status).toBe(500);
    expect(JSON.stringify(await crash.json())).not.toContain("hunter2");
  });
});
