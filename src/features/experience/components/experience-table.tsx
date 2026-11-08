"use client";

import { MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { DataTableSearch } from "@/components/data-table/data-table-search";
import { serverColumnHelper, useServerTable } from "@/components/data-table/use-server-table";
import { PageHeader } from "@/components/layout/admin/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatMonthRange } from "@/lib/format";
import { useTableView, viewToListParams, type TableViewState } from "@/stores/table-store";
import { useDeleteExperience, useExperienceList } from "../hooks/use-experience";
import type { ExperienceListParams, ExperienceRow } from "../schemas/experience";

const defaults: TableViewState = {
  sorting: [{ id: "startDate", desc: true }],
  pagination: { pageIndex: 0, pageSize: 10 },
  search: "",
  filters: {},
};

const helper = serverColumnHelper<ExperienceRow>();

function buildColumns(onDelete: (e: ExperienceRow) => void) {
  return [
    helper.accessor("role", {
      header: "Role",
      cell: ({ row }) => (
        <span className="flex items-center gap-2">
          <Link
            href={`/admin/experience/${row.original.id}`}
            className="font-medium underline-offset-4 hover:underline"
          >
            {row.original.role}
          </Link>
          {row.original.endDate === null && <Badge variant="secondary">Current</Badge>}
        </span>
      ),
    }),
    helper.accessor("company", { header: "Company" }),
    helper.accessor("startDate", {
      header: "Dates",
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {formatMonthRange(row.original.startDate, row.original.endDate)}
        </span>
      ),
    }),
    helper.accessor("location", {
      header: "Location",
      enableSorting: false,
      cell: (info) => info.getValue() ?? <span className="text-muted-foreground">None</span>,
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
              aria-label={`Actions for ${row.original.role} at ${row.original.company}`}
            >
              <MoreHorizontal aria-hidden />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/admin/experience/${row.original.id}`}>
                <Pencil aria-hidden /> Edit
              </Link>
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

export function ExperienceTable() {
  const controls = useTableView("experience", defaults);
  const query = useExperienceList(viewToListParams(controls.view) as ExperienceListParams);
  const remove = useDeleteExperience();
  const [deleting, setDeleting] = useState<ExperienceRow | null>(null);
  const [columns] = useState(() => buildColumns(setDeleting));
  const table = useServerTable({ columns, data: query.data, controls });

  const confirmDelete = () => {
    if (!deleting) return;
    remove.mutate(deleting.id, {
      onSuccess: () => {
        toast.success(`Deleted ${deleting.role} at ${deleting.company}`);
        setDeleting(null);
      },
      onError: (error) => toast.error(error.message),
    });
  };

  return (
    <>
      <PageHeader
        title="Experience"
        description="Roles shown on the timeline of your home page, newest first."
        actions={
          <Button asChild>
            <Link href="/admin/experience/new">
              <Plus aria-hidden /> Add experience
            </Link>
          </Button>
        }
      />
      <div className="space-y-4">
        <DataTableSearch
          label="Search roles and companies"
          value={controls.view.search}
          onChange={controls.setSearch}
        />
        <DataTable
          table={table}
          caption="Experience"
          isLoading={query.isPending}
          isError={query.isError}
          isFetching={query.isPlaceholderData}
          empty={controls.view.search ? "No roles match this search." : "No experience yet."}
        />
        <DataTablePagination table={table} total={query.data?.total ?? 0} />
      </div>
      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={deleting ? `Delete ${deleting.role} at ${deleting.company}?` : "Delete entry?"}
        description="It will be removed from your timeline. This cannot be undone."
        pending={remove.isPending}
        onConfirm={confirmDelete}
      />
    </>
  );
}
