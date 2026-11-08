"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
  type QueryKey,
} from "@tanstack/react-query";
import { dashboardKeys } from "@/features/dashboard/api/keys";
import type { Paginated } from "@/lib/api/types";
import { messageKeys, messagesApi } from "../api/messages";
import type { MessageListParams, MessageRow } from "../schemas/message";

export function useMessageList(params: MessageListParams) {
  return useQuery({
    queryKey: messageKeys.list(params),
    queryFn: () => messagesApi.list(params),
    placeholderData: keepPreviousData,
  });
}

/**
 * Marks a message read or unread. The change shows instantly in every cached
 * page of the inbox and is rolled back if the request fails.
 */
export function useSetMessageRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isRead }: { id: string; isRead: boolean }) =>
      messagesApi.update(id, { isRead }),
    onMutate: async ({ id, isRead }) => {
      await queryClient.cancelQueries({ queryKey: messageKeys.lists() });
      const previous = queryClient.getQueriesData<Paginated<MessageRow>>({
        queryKey: messageKeys.lists(),
      });
      queryClient.setQueriesData<Paginated<MessageRow>>(
        { queryKey: messageKeys.lists() },
        (page) =>
          page && {
            ...page,
            items: page.items.map((m) => (m.id === id ? { ...m, isRead } : m)),
          },
      );
      return { previous };
    },
    onError: (_error, _vars, context) => {
      context?.previous.forEach(([key, data]: [QueryKey, unknown]) =>
        queryClient.setQueryData(key, data),
      );
    },
    onSettled: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: messageKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: dashboardKeys.all }),
      ]),
  });
}

export function useDeleteMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: messagesApi.remove,
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: messageKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: dashboardKeys.all }),
      ]),
  });
}
