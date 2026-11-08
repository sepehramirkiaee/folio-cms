"use client";

import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import type { ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { ServerTable } from "./use-server-table";

type DataTableProps<T extends { id: string }> = {
  table: ServerTable<T>;
  /** Accessible name for the table, read by screen readers. */
  caption: string;
  isLoading: boolean;
  isError?: boolean;
  /** True while a new page loads behind the previous one. */
  isFetching?: boolean;
  empty: ReactNode;
};

export function DataTable<T extends { id: string }>({
  table,
  caption,
  isLoading,
  isError,
  isFetching,
  empty,
}: DataTableProps<T>) {
  const columns = table.getAllLeafColumns();
  const rows = table.getRowModel().rows;

  return (
    <div className="rounded-lg border" aria-busy={isLoading || isFetching}>
      <Table className={cn(isFetching && !isLoading && "opacity-60 transition-opacity")}>
        <caption className="sr-only">{caption}</caption>
        <TableHeader>
          {table.getHeaderGroups().map((group) => (
            <TableRow key={group.id}>
              {group.headers.map((header) => {
                const sorted = header.column.getIsSorted();
                const canSort = header.column.getCanSort();
                return (
                  <TableHead
                    key={header.id}
                    aria-sort={
                      sorted === "asc" ? "ascending" : sorted === "desc" ? "descending" : undefined
                    }
                  >
                    {header.isPlaceholder ? null : canSort ? (
                      <button
                        type="button"
                        onClick={header.column.getToggleSortingHandler()}
                        className="-mx-2 inline-flex items-center gap-1 rounded px-2 py-1 outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <table.FlexRender header={header} />
                        {sorted === "asc" ? (
                          <ArrowUp className="size-3.5" aria-hidden />
                        ) : sorted === "desc" ? (
                          <ArrowDown className="size-3.5" aria-hidden />
                        ) : (
                          <ArrowUpDown className="size-3.5 text-muted-foreground/60" aria-hidden />
                        )}
                      </button>
                    ) : (
                      <table.FlexRender header={header} />
                    )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: 5 }, (_, i) => (
              <TableRow key={i}>
                {columns.map((column) => (
                  <TableCell key={column.id}>
                    <Skeleton className="h-5 w-full max-w-40" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : isError ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center text-destructive">
                Could not load this list. Please refresh the page.
              </TableCell>
            </TableRow>
          ) : rows.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center text-muted-foreground"
              >
                {empty}
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => (
              <TableRow key={row.id}>
                {row.getAllCells().map((cell) => (
                  <TableCell key={cell.id}>
                    <table.FlexRender cell={cell} />
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
