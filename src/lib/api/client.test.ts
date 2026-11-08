import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import { server } from "@/test/msw/server";
import { ApiClientError, apiFetch } from "./client";

describe("apiFetch", () => {
  it("unwraps data and sends JSON bodies", async () => {
    server.use(
      http.post("*/api/admin/things", async ({ request }) => {
        const body = (await request.json()) as { name: string };
        return HttpResponse.json({ data: { id: "1", name: body.name } }, { status: 201 });
      }),
    );
    await expect(
      apiFetch("http://localhost/api/admin/things", { method: "POST", json: { name: "A" } }),
    ).resolves.toEqual({ id: "1", name: "A" });
  });

  it("returns undefined for 204 responses", async () => {
    server.use(http.delete("*/api/admin/things/1", () => new HttpResponse(null, { status: 204 })));
    await expect(
      apiFetch("http://localhost/api/admin/things/1", { method: "DELETE" }),
    ).resolves.toBeUndefined();
  });

  it("throws ApiClientError with code and field errors", async () => {
    server.use(
      http.post("*/api/admin/things", () =>
        HttpResponse.json(
          {
            error: {
              code: "VALIDATION_ERROR",
              message: "Some fields are invalid",
              fieldErrors: { name: ["Required"] },
            },
          },
          { status: 422 },
        ),
      ),
    );
    const error = await apiFetch("http://localhost/api/admin/things", {
      method: "POST",
      json: {},
    }).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiClientError);
    expect(error).toMatchObject({
      status: 422,
      code: "VALIDATION_ERROR",
      fieldErrors: { name: ["Required"] },
    });
  });

  it("handles non-JSON error responses", async () => {
    server.use(
      http.get("*/api/admin/broken", () => new HttpResponse("Bad gateway", { status: 502 })),
    );
    await expect(apiFetch("http://localhost/api/admin/broken")).rejects.toMatchObject({
      status: 502,
      code: "INTERNAL",
    });
  });
});
