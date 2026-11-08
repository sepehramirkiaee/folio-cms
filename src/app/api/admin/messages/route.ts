import { messageListParamsSchema } from "@/features/messages/schemas/message";
import { listMessages } from "@/features/messages/server/messages";
import { parseQuery, withAdmin } from "@/lib/api/handler";

export const GET = withAdmin(async (req) => listMessages(parseQuery(req, messageListParamsSchema)));
