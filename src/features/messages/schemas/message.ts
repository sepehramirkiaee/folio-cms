import { z } from "zod";
import { listParamsSchema } from "@/lib/api/list-params";

export const messageListParamsSchema = listParamsSchema(
  ["createdAt", "name"],
  "createdAt",
  "desc",
).extend({
  status: z.enum(["unread", "read"]).optional().catch(undefined),
});
export type MessageListParams = z.input<typeof messageListParamsSchema>;

export const messageUpdateSchema = z.object({ isRead: z.boolean() });
export type MessageUpdate = z.infer<typeof messageUpdateSchema>;

export type MessageRow = {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  isRead: boolean;
  createdAt: string;
};
