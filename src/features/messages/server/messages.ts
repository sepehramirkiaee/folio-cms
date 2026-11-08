import "server-only";
import type { z } from "zod";
import type { Prisma } from "@/generated/prisma/client";
import { paginate } from "@/lib/api/list-params";
import { getDb } from "@/lib/db";
import type { MessageRow, MessageUpdate, messageListParamsSchema } from "../schemas/message";

type Message = Prisma.ContactMessageGetPayload<object>;

const toRow = ({ createdAt, ...m }: Message): MessageRow => ({
  ...m,
  createdAt: createdAt.toISOString(),
});

export async function listMessages(params: z.output<typeof messageListParamsSchema>) {
  const where: Prisma.ContactMessageWhereInput = {
    ...(params.status && { isRead: params.status === "read" }),
    ...(params.q && {
      OR: [
        { name: { contains: params.q, mode: "insensitive" } },
        { email: { contains: params.q, mode: "insensitive" } },
        { subject: { contains: params.q, mode: "insensitive" } },
        { message: { contains: params.q, mode: "insensitive" } },
      ],
    }),
  };
  const db = getDb();
  const [items, total] = await db.$transaction([
    db.contactMessage.findMany({
      where,
      orderBy: [{ [params.sort]: params.dir }, { createdAt: "desc" }],
      skip: (params.page - 1) * params.pageSize,
      take: params.pageSize,
    }),
    db.contactMessage.count({ where }),
  ]);
  return paginate(items.map(toRow), total, params.page, params.pageSize);
}

export async function updateMessage(id: string, data: MessageUpdate): Promise<MessageRow> {
  return toRow(await getDb().contactMessage.update({ where: { id }, data }));
}

export async function deleteMessage(id: string): Promise<void> {
  await getDb().contactMessage.delete({ where: { id } });
}

export async function latestMessages(take = 5): Promise<MessageRow[]> {
  const items = await getDb().contactMessage.findMany({ orderBy: { createdAt: "desc" }, take });
  return items.map(toRow);
}
