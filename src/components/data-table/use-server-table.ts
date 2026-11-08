"use client";

import {
  createColumnHelper,
  rowPaginationFeature,
  rowSortingFeature,
  tableFeatures,
  useTable,
  type ColumnDef,
  type RowData,
} from "@tanstack/react-table";
import type { Paginated } from "@/lib/api/types";
import type { useTableView } from "@/stores/table-store";

/**
 * Every admin list sorts, filters and paginates on the server, so the table
 * registers the sorting and pagination features without client row models.
 */
export const serverTableFeatures = tableFeatures({ rowSortingFeature, rowPaginationFeature });
export type ServerTableFeatures = typeof serverTableFeatures;

export function serverColumnHelper<T extends RowData>() {
  return createColumnHelper<ServerTableFeatures, T>();
}

const emptyRows: never[] = [];

type Options<T extends { id: string }> = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- column value types vary per column
  columns: ColumnDef<ServerTableFeatures, T, any>[];
  data: Paginated<T> | undefined;
  controls: ReturnType<typeof useTableView>;
};

export function useServerTable<T extends { id: string }>({ columns, data, controls }: Options<T>) {
  return useTable({
    features: serverTableFeatures,
    columns,
    data: data?.items ?? emptyRows,
    rowCount: data?.total ?? 0,
    getRowId: (row) => row.id,
    manualSorting: true,
    manualPagination: true,
    enableSortingRemoval: false,
    enableMultiSort: false,
    state: { sorting: controls.view.sorting, pagination: controls.view.pagination },
    onSortingChange: controls.setSorting,
    onPaginationChange: controls.setPagination,
  });
}

export type ServerTable<T extends { id: string }> = ReturnType<typeof useServerTable<T>>;
