"use client";

import { MoreHorizontal, Pencil, Star, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { DataTableSearch } from "@/components/data-table/data-table-search";
import { serverColumnHelper, useServerTable } from "@/components/data-table/use-server-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { useTableView, viewToListParams, type TableViewState } from "@/stores/table-store";
import { useDeleteProject, useProjectList } from "../hooks/use-projects";
import {
  PROJECT_STATUS_LABELS,
  projectStatuses,
  type ProjectListParams,
  type ProjectRow,
} from "../schemas/project";

const defaults: TableViewState = {
  sorting: [{ id: "order", desc: false }],
  pagination: { pageIndex: 0, pageSize: 10 },
  search: "",
  filters: {},
};

const shortDate = new Intl.DateTimeFormat("en", { dateStyle: "medium" });
const helper = serverColumnHelper<ProjectRow>();

function buildColumns(onDelete: (p: ProjectRow) => void) {
  return [
    helper.accessor("sortOrder", {
      id: "order",
      header: "#",
      cell: (info) => (
        <span className="text-muted-foreground tabular-nums">{info.getValue() + 1}</span>
      ),
    }),
    helper.accessor("title", {
      header: "Title",
      cell: ({ row }) => (
        <span className="flex items-center gap-2">
          <Link
            href={`/admin/projects/${row.original.id}`}
            className="font-medium underline-offset-4 hover:underline"
          >
            {row.original.title}
          </Link>
          {row.original.featured && (
            <Star
              className="size-3.5 fill-current text-amber-600 dark:text-amber-400"
              aria-label="Featured"
            />
          )}
        </span>
      ),
    }),
    helper.accessor("status", {
      header: "Status",
      cell: (info) => (
        <Badge variant={info.getValue() === "PUBLISHED" ? "default" : "outline"}>
          {PROJECT_STATUS_LABELS[info.getValue()]}
        </Badge>
      ),
    }),
    helper.accessor("year", {
      header: "Year",
      cell: (info) => info.getValue() ?? <span className="text-muted-foreground">None</span>,
    }),
    helper.accessor("updatedAt", {
      header: "Updated",
      cell: (info) => (
        <time dateTime={info.getValue()} className="text-muted-foreground">
          {shortDate.format(new Date(info.getValue()))}
        </time>
      ),
    }),
    helper.display({
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${row.original.title}`}>
              <MoreHorizontal aria-hidden />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/admin/projects/${row.original.id}`}>
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

export function ProjectsTable() {
  const controls = useTableView("projects", defaults);
  const query = useProjectList(viewToListParams(controls.view) as ProjectListParams);
  const deleteProject = useDeleteProject();
  const [deleting, setDeleting] = useState<ProjectRow | null>(null);
  const [columns] = useState(() => buildColumns(setDeleting));
  const table = useServerTable({ columns, data: query.data, controls });

  const confirmDelete = () => {
    if (!deleting) return;
    deleteProject.mutate(deleting.id, {
      onSuccess: () => {
        toast.success(`Deleted ${deleting.title}`);
        setDeleting(null);
      },
      onError: (error) => toast.error(error.message),
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row">
        <DataTableSearch
          label="Search projects"
          value={controls.view.search}
          onChange={controls.setSearch}
        />
        <Select
          value={controls.view.filters.status ?? "all"}
          onValueChange={(v) => controls.setFilter("status", v === "all" ? "" : v)}
        >
          <SelectTrigger className="sm:w-44" aria-label="Filter by status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {projectStatuses.map((s) => (
              <SelectItem key={s} value={s}>
                {PROJECT_STATUS_LABELS[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DataTable
        table={table}
        caption="Projects"
        isLoading={query.isPending}
        isError={query.isError}
        isFetching={query.isPlaceholderData}
        empty={
          controls.view.search || controls.view.filters.status
            ? "No projects match these filters."
            : "No projects yet. Create your first one."
        }
      />
      <DataTablePagination table={table} total={query.data?.total ?? 0} />

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={`Delete ${deleting?.title ?? "project"}?`}
        description="The project and its case study are removed from the site. This cannot be undone."
        pending={deleteProject.isPending}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
