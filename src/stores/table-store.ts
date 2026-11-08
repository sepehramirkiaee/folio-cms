import type { PaginationState, SortingState, Updater } from "@tanstack/react-table";
import { functionalUpdate } from "@tanstack/react-table";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

/** UI state for one admin table: what the user is looking at, not the rows. */
export type TableViewState = {
  sorting: SortingState;
  pagination: PaginationState;
  search: string;
  filters: Record<string, string>;
};

type TableStore = {
  tables: Record<string, TableViewState>;
  update: (id: string, defaults: TableViewState, patch: Partial<TableViewState>) => void;
};

/**
 * Sorting, paging, search and filters for every admin table, keyed by table
 * id. Kept for the browser session, so returning to a list restores the view.
 */
export const useTableStore = create<TableStore>()(
  persist(
    (set) => ({
      tables: {},
      update: (id, defaults, patch) =>
        set((s) => ({
          tables: { ...s.tables, [id]: { ...(s.tables[id] ?? defaults), ...patch } },
        })),
    }),
    { name: "folio-tables", storage: createJSONStorage(() => sessionStorage) },
  ),
);

/** Read and update one table's view state, with setters shaped for TanStack Table. */
export function useTableView(id: string, defaults: TableViewState) {
  const view = useTableStore((s) => s.tables[id]) ?? defaults;
  const update = useTableStore((s) => s.update);

  return {
    view,
    setSorting: (updater: Updater<SortingState>) =>
      update(id, defaults, {
        sorting: functionalUpdate(updater, view.sorting),
        // A new sort order starts back at the first page.
        pagination: { ...view.pagination, pageIndex: 0 },
      }),
    setPagination: (updater: Updater<PaginationState>) =>
      update(id, defaults, { pagination: functionalUpdate(updater, view.pagination) }),
    setSearch: (search: string) =>
      update(id, defaults, { search, pagination: { ...view.pagination, pageIndex: 0 } }),
    setFilter: (key: string, value: string) =>
      update(id, defaults, {
        filters: { ...view.filters, [key]: value },
        pagination: { ...view.pagination, pageIndex: 0 },
      }),
    reset: () => update(id, defaults, defaults),
  };
}

/** Maps table view state to the API's list query params. */
export function viewToListParams(view: TableViewState) {
  const [sort] = view.sorting;
  return {
    page: view.pagination.pageIndex + 1,
    pageSize: view.pagination.pageSize,
    q: view.search.trim() || undefined,
    sort: sort?.id,
    dir: sort ? (sort.desc ? "desc" : "asc") : undefined,
    ...view.filters,
  };
}
