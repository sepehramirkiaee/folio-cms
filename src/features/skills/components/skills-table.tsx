"use client";

import { MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
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
  Dialog,
  DialogContent,
  DialogDescription,
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
import { useTableView, viewToListParams, type TableViewState } from "@/stores/table-store";
import { useDeleteSkill, useSkillList } from "../hooks/use-skills";
import {
  SKILL_CATEGORY_LABELS,
  skillCategories,
  type SkillListParams,
  type SkillRow,
} from "../schemas/skill";
import { SkillForm } from "./skill-form";

const defaults: TableViewState = {
  sorting: [{ id: "name", desc: false }],
  pagination: { pageIndex: 0, pageSize: 10 },
  search: "",
  filters: {},
};

type Actions = { onEdit: (s: SkillRow) => void; onDelete: (s: SkillRow) => void };

const helper = serverColumnHelper<SkillRow>();

function buildColumns({ onEdit, onDelete }: Actions) {
  return [
    helper.accessor("name", {
      header: "Name",
      cell: (info) => <span className="font-medium">{info.getValue()}</span>,
    }),
    helper.accessor("category", {
      header: "Category",
      cell: (info) => <Badge variant="secondary">{SKILL_CATEGORY_LABELS[info.getValue()]}</Badge>,
    }),
    helper.accessor("projectCount", {
      id: "usage",
      header: "Used in",
      cell: ({ row }) => {
        const { projectCount: p, experienceCount: e } = row.original;
        return (
          <span className="text-muted-foreground tabular-nums">
            {p} {p === 1 ? "project" : "projects"}, {e} {e === 1 ? "role" : "roles"}
          </span>
        );
      },
    }),
    helper.accessor("featured", {
      header: "On site",
      enableSorting: false,
      cell: (info) => (info.getValue() ? "Yes" : <span className="text-muted-foreground">No</span>),
    }),
    helper.display({
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${row.original.name}`}>
              <MoreHorizontal aria-hidden />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => onEdit(row.original)}>
              <Pencil aria-hidden /> Edit
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

export function SkillsTable() {
  const controls = useTableView("skills", defaults);
  const params = viewToListParams(controls.view) as SkillListParams;
  const query = useSkillList(params);
  const deleteSkill = useDeleteSkill();

  const [editing, setEditing] = useState<SkillRow | "new" | null>(null);
  const [deleting, setDeleting] = useState<SkillRow | null>(null);

  // Columns close over stable setState functions, so they are built once.
  const [columns] = useState(() => buildColumns({ onEdit: setEditing, onDelete: setDeleting }));
  const table = useServerTable({ columns, data: query.data, controls });

  const confirmDelete = () => {
    if (!deleting) return;
    deleteSkill.mutate(deleting.id, {
      onSuccess: () => {
        toast.success(`Deleted ${deleting.name}`);
        setDeleting(null);
      },
      onError: (error) => toast.error(error.message),
    });
  };

  return (
    <>
      <PageHeader
        title="Skills"
        description="Technologies and practices you can tag on projects and roles."
        actions={
          <Button onClick={() => setEditing("new")}>
            <Plus aria-hidden /> New skill
          </Button>
        }
      />

      <div className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row">
          <DataTableSearch
            label="Search skills"
            value={controls.view.search}
            onChange={controls.setSearch}
          />
          <Select
            value={controls.view.filters.category ?? "all"}
            onValueChange={(v) => controls.setFilter("category", v === "all" ? "" : v)}
          >
            <SelectTrigger className="sm:w-48" aria-label="Filter by category">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {skillCategories.map((c) => (
                <SelectItem key={c} value={c}>
                  {SKILL_CATEGORY_LABELS[c]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <DataTable
          table={table}
          caption="Skills"
          isLoading={query.isPending}
          isError={query.isError}
          isFetching={query.isPlaceholderData}
          empty={
            controls.view.search || controls.view.filters.category
              ? "No skills match these filters."
              : "No skills yet. Add your first one."
          }
        />
        <DataTablePagination table={table} total={query.data?.total ?? 0} />
      </div>

      <Dialog open={editing !== null} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing === "new" ? "New skill" : "Edit skill"}</DialogTitle>
            <DialogDescription>
              Skills can be tagged on projects and on experience entries.
            </DialogDescription>
          </DialogHeader>
          {editing !== null && (
            <SkillForm
              skill={editing === "new" ? undefined : editing}
              onDone={() => setEditing(null)}
              onCancel={() => setEditing(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={`Delete ${deleting?.name ?? "skill"}?`}
        description={
          deleting && deleting.projectCount + deleting.experienceCount > 0
            ? `It will be removed from ${deleting.projectCount} projects and ${deleting.experienceCount} roles. This cannot be undone.`
            : "This cannot be undone."
        }
        pending={deleteSkill.isPending}
        onConfirm={confirmDelete}
      />
    </>
  );
}
