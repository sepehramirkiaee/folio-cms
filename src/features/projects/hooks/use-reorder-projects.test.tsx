import { QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { delay, http, HttpResponse } from "msw";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";
import { server } from "@/test/msw/server";
import { createTestQueryClient } from "@/test/utils/render";
import { projectKeys } from "../api/projects";
import type { ProjectOrderItem } from "../schemas/project";
import { useReorderProjects } from "./use-projects";

const item = (id: string, sortOrder: number): ProjectOrderItem => ({
  id,
  title: `Project ${id}`,
  status: "PUBLISHED",
  featured: false,
  sortOrder,
});
const original = [item("a", 0), item("b", 1), item("c", 2)];
const moved = [original[1]!, original[0]!, original[2]!];

function setup() {
  const queryClient = createTestQueryClient();
  queryClient.setQueryData(projectKeys.order(), original);
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  const { result } = renderHook(() => useReorderProjects(), { wrapper });
  const ids = () =>
    queryClient.getQueryData<ProjectOrderItem[]>(projectKeys.order())?.map((p) => p.id);
  return { result, ids };
}

describe("useReorderProjects", () => {
  it("moves the list immediately, before the server answers", async () => {
    let sent: unknown;
    server.use(
      http.put("*/api/admin/projects/order", async ({ request }) => {
        sent = await request.json();
        await delay(50);
        return HttpResponse.json({ data: moved.map((p, i) => ({ ...p, sortOrder: i })) });
      }),
      http.get("*/api/admin/projects/order", () =>
        HttpResponse.json({ data: moved.map((p, i) => ({ ...p, sortOrder: i })) }),
      ),
    );
    const { result, ids } = setup();

    act(() => result.current.mutate(moved));

    await waitFor(() => expect(ids()).toEqual(["b", "a", "c"]));
    expect(result.current.isPending).toBe(true);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(sent).toEqual({ ids: ["b", "a", "c"] });
  });

  it("rolls back to the previous order when the server rejects it", async () => {
    server.use(
      http.put("*/api/admin/projects/order", async () => {
        await delay(200);
        return HttpResponse.json(
          { error: { code: "CONFLICT", message: "The project list changed." } },
          { status: 409 },
        );
      }),
      http.get("*/api/admin/projects/order", () => HttpResponse.json({ data: original })),
    );
    const { result, ids } = setup();

    act(() => result.current.mutate(moved));
    await waitFor(() => expect(ids()).toEqual(["b", "a", "c"]));

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(ids()).toEqual(["a", "b", "c"]);
    expect(result.current.error?.message).toBe("The project list changed.");
  });
});
