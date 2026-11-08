import { QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { delay, http, HttpResponse } from "msw";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";
import type { Paginated } from "@/lib/api/types";
import { server } from "@/test/msw/server";
import { createTestQueryClient } from "@/test/utils/render";
import { messageKeys } from "../api/messages";
import type { MessageRow } from "../schemas/message";
import { useSetMessageRead } from "./use-messages";

const message: MessageRow = {
  id: "m1",
  name: "Priya",
  email: "p@example.com",
  subject: null,
  message: "Hi",
  isRead: false,
  createdAt: "2026-11-01T10:00:00.000Z",
};
const page: Paginated<MessageRow> = {
  items: [message],
  total: 1,
  page: 1,
  pageSize: 10,
  pageCount: 1,
};
const unreadKey = messageKeys.list({ status: "unread" });
const allKey = messageKeys.list({});

function setup() {
  const queryClient = createTestQueryClient();
  queryClient.setQueryData(allKey, page);
  queryClient.setQueryData(unreadKey, page);
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  const { result } = renderHook(() => useSetMessageRead(), { wrapper });
  const isRead = (key: readonly unknown[]) =>
    queryClient.getQueryData<Paginated<MessageRow>>(key)?.items[0]?.isRead;
  return { result, isRead };
}

describe("useSetMessageRead", () => {
  it("updates every cached inbox page and rolls back on failure", async () => {
    server.use(
      http.patch("*/api/admin/messages/m1", async () => {
        await delay(200);
        return HttpResponse.json({ error: { code: "INTERNAL", message: "Down" } }, { status: 500 });
      }),
      http.get("*/api/admin/messages", () => HttpResponse.json({ data: page })),
      http.get("*/api/admin/stats", () => HttpResponse.json({ data: {} })),
    );
    const { result, isRead } = setup();

    act(() => result.current.mutate({ id: "m1", isRead: true }));
    await waitFor(() => expect(isRead(allKey)).toBe(true));
    expect(isRead(unreadKey)).toBe(true);

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(isRead(allKey)).toBe(false);
    expect(isRead(unreadKey)).toBe(false);
  });
});
