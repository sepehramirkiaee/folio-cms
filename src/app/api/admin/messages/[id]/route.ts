import { messageUpdateSchema } from "@/features/messages/schemas/message";
import { deleteMessage, updateMessage } from "@/features/messages/server/messages";
import { parseBody, withAdmin } from "@/lib/api/handler";

type Ctx = RouteContext<"/api/admin/messages/[id]">;

export const PATCH = withAdmin(async (req, ctx: Ctx) =>
  updateMessage((await ctx.params).id, await parseBody(req, messageUpdateSchema)),
);

export const DELETE = withAdmin(async (_req, ctx: Ctx) => deleteMessage((await ctx.params).id));
