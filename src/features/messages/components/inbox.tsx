"use client";

import { Mail, MailOpen, MoreHorizontal, Reply, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { DataTableSearch } from "@/components/data-table/data-table-search";
import { serverColumnHelper, useServerTable } from "@/components/data-table/use-server-table";
import { PageHeader } from "@/components/layout/admin/page-header";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useTableView, viewToListParams, type TableViewState } from "@/stores/table-store";
import { useDeleteMessage, useMessageList, useSetMessageRead } from "../hooks/use-messages";
import type { MessageListParams, MessageRow } from "../schemas/message";

const defaults: TableViewState = {
  sorting: [{ id: "createdAt", desc: true }],
  pagination: { pageIndex: 0, pageSize: 10 },
  search: "",
  filters: {},
};

const received = new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" });

type Actions = {
  onOpen: (m: MessageRow) => void;
  onToggleRead: (m: MessageRow) => void;
  onDelete: (m: MessageRow) => void;
};

const helper = serverColumnHelper<MessageRow>();

function buildColumns({ onOpen, onToggleRead, onDelete }: Actions) {
  return [
    helper.accessor("name", {
      header: "From",
      cell: ({ row }) => (
        <span className="flex items-center gap-2">
          <span
            className={cn("size-2 shrink-0 rounded-full", !row.original.isRead && "bg-brand")}
            aria-hidden
          />
          <span className="min-w-0">
            <span className={cn("block truncate", !row.original.isRead && "font-semibold")}>
              {row.original.name}
              {!row.original.isRead && <span className="sr-only"> (unread)</span>}
            </span>
            <span className="block truncate text-xs text-muted-foreground">
              {row.original.email}
            </span>
          </span>
        </span>
      ),
    }),
    helper.accessor("subject", {
      header: "Message",
      enableSorting: false,
      cell: ({ row }) => (
        <button
          type="button"
          onClick={() => onOpen(row.original)}
          className="block max-w-md truncate rounded text-left outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className={cn(!row.original.isRead && "font-semibold")}>
            {row.original.subject ?? "No subject"}
          </span>
          <span className="text-muted-foreground"> {row.original.message}</span>
        </button>
      ),
    }),
    helper.accessor("createdAt", {
      header: "Received",
      cell: (info) => (
        <time dateTime={info.getValue()} className="whitespace-nowrap text-muted-foreground">
          {received.format(new Date(info.getValue()))}
        </time>
      ),
    }),
    helper.display({
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Actions for message from ${row.original.name}`}
            >
              <MoreHorizontal aria-hidden />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => onOpen(row.original)}>
              <MailOpen aria-hidden /> Open
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onToggleRead(row.original)}>
              <Mail aria-hidden /> {row.original.isRead ? "Mark as unread" : "Mark as read"}
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onSelect={() => onDelete(row.original)}>
              <Trash2 aria-hidden /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    }),
  ];
}

export function Inbox() {
  const controls = useTableView("messages", defaults);
  const query = useMessageList(viewToListParams(controls.view) as MessageListParams);
  const setRead = useSetMessageRead();
  const remove = useDeleteMessage();

  const [opened, setOpened] = useState<MessageRow | null>(null);
  const [deleting, setDeleting] = useState<MessageRow | null>(null);

  const [columns] = useState(() =>
    buildColumns({
      onOpen: setOpened,
      onToggleRead: (m) =>
        setRead.mutate(
          { id: m.id, isRead: !m.isRead },
          { onError: (error) => toast.error(error.message) },
        ),
      onDelete: setDeleting,
    }),
  );
  const table = useServerTable({ columns, data: query.data, controls });

  // Opening a message marks it as read.
  const openedId = opened?.id;
  const openedUnread = opened && !opened.isRead;
  useEffect(() => {
    if (openedId && openedUnread) setRead.mutate({ id: openedId, isRead: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once per opened message
  }, [openedId]);

  const confirmDelete = () => {
    if (!deleting) return;
    remove.mutate(deleting.id, {
      onSuccess: () => {
        toast.success(`Deleted message from ${deleting.name}`);
        setDeleting(null);
        setOpened(null);
      },
      onError: (error) => toast.error(error.message),
    });
  };

  return (
    <>
      <PageHeader
        title="Inbox"
        description="Messages sent through the contact form on your site."
      />
      <div className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row">
          <DataTableSearch
            label="Search messages"
            value={controls.view.search}
            onChange={controls.setSearch}
          />
          <Select
            value={controls.view.filters.status ?? "all"}
            onValueChange={(v) => controls.setFilter("status", v === "all" ? "" : v)}
          >
            <SelectTrigger className="sm:w-40" aria-label="Filter by read status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All messages</SelectItem>
              <SelectItem value="unread">Unread</SelectItem>
              <SelectItem value="read">Read</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <DataTable
          table={table}
          caption="Contact messages"
          isLoading={query.isPending}
          isError={query.isError}
          isFetching={query.isPlaceholderData}
          empty={
            controls.view.search || controls.view.filters.status
              ? "No messages match these filters."
              : "No messages yet. They appear here when someone uses your contact form."
          }
        />
        <DataTablePagination table={table} total={query.data?.total ?? 0} />
      </div>

      <Dialog open={opened !== null} onOpenChange={(open) => !open && setOpened(null)}>
        <DialogContent className="sm:max-w-lg">
          {opened && (
            <>
              <DialogHeader>
                <DialogTitle>{opened.subject ?? "No subject"}</DialogTitle>
                <DialogDescription>
                  From {opened.name} ({opened.email}), {received.format(new Date(opened.createdAt))}
                </DialogDescription>
              </DialogHeader>
              <p className="max-h-80 overflow-y-auto text-sm whitespace-pre-wrap">
                {opened.message}
              </p>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDeleting(opened)}>
                  <Trash2 aria-hidden /> Delete
                </Button>
                <Button asChild>
                  <a
                    href={`mailto:${opened.email}?subject=${encodeURIComponent(`Re: ${opened.subject ?? "Your message"}`)}`}
                  >
                    <Reply aria-hidden /> Reply by email
                  </a>
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={`Delete message from ${deleting?.name ?? "sender"}?`}
        description="This cannot be undone."
        pending={remove.isPending}
        onConfirm={confirmDelete}
      />
    </>
  );
}
