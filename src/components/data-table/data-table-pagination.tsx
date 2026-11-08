"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ServerTable } from "./use-server-table";

const PAGE_SIZES = [10, 20, 50];

export function DataTablePagination<T extends { id: string }>({
  table,
  total,
}: {
  table: ServerTable<T>;
  total: number;
}) {
  const { pageIndex, pageSize } = table.state.pagination;
  const pageCount = Math.max(1, table.getPageCount());

  return (
    <div className="flex flex-col-reverse items-center justify-between gap-3 sm:flex-row">
      <p className="text-sm text-muted-foreground" aria-live="polite">
        {total} {total === 1 ? "result" : "results"}
      </p>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span id="rows-per-page" className="text-sm">
            Rows per page
          </span>
          <Select
            value={String(pageSize)}
            onValueChange={(value) =>
              table.setPagination({ pageIndex: 0, pageSize: Number(value) })
            }
          >
            <SelectTrigger size="sm" className="w-18" aria-labelledby="rows-per-page">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZES.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <span className="text-sm tabular-nums">
          Page {pageIndex + 1} of {pageCount}
        </span>
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            aria-label="Previous page"
          >
            <ChevronLeft aria-hidden />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            aria-label="Next page"
          >
            <ChevronRight aria-hidden />
          </Button>
        </div>
      </div>
    </div>
  );
}
