'use client';

import {
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type PaginationState,
  type SortingState,
  type VisibilityState,
} from '@tanstack/react-table';
import * as React from 'react';
import type {
  DataTableFilterableColumn,
  DataTableSearchableColumn,
  FilterParam,
  PageSize,
  SortableField,
} from '~/lib/data-table/types';

import { debounce } from 'lodash';
import { useTableStateFromSearchParams } from '~/app/dashboard/_components/ActivityFeed/useTableStateFromSearchParams';

import { useRouter } from 'next/navigation';

type UseDataTableProps<TData, TValue> = {
  /**
   * The data for the table
   * @default []
   * @type TData[]
   */
  data: TData[];

  /**
   * The columns of the table
   * @default []
   * @type ColumnDef<TData, TValue>[]
   */
  columns: ColumnDef<TData, TValue>[];

  /**
   * The number of pages in the table
   * @type number
   */
  pageCount: number;

  /**
   * The searchable columns of the table
   * @default []
   * @type {id: keyof TData, title: string}[]
   * @example searchableColumns={[{ id: "title", title: "titles" }]}
   */
  searchableColumns?: DataTableSearchableColumn<TData>[];

  /**
   * The filterable columns of the table. When provided, renders dynamic faceted filters, and the advancedFilter prop is ignored.
   * @default []
   * @type {id: keyof TData, title: string, options: { label: string, value: string, icon?: React.ComponentType<{ className?: string }> }[]}[]
   * @example filterableColumns={[{ id: "status", title: "Status", options: ["todo", "in-progress", "done", "canceled"]}]}
   */
  filterableColumns?: DataTableFilterableColumn<TData>[];
};

export function useDataTable<TData, TValue>({
  data,
  columns,
  pageCount, // Todo: the below should be used to filter filter/search terms before setting search params
  // searchableColumns = [],
  // filterableColumns = [],
}: UseDataTableProps<TData, TValue>) {
  const { searchParams, setSearchParams } = useTableStateFromSearchParams();
  const router = useRouter();

  // Table states
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    (searchParams.filterParams as ColumnFiltersState) ?? [],
  );

  const [{ pageIndex, pageSize }, setPagination] =
    React.useState<PaginationState>({
      pageIndex: searchParams.page - 1,
      pageSize: searchParams.perPage,
    });

  const pagination = React.useMemo(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize],
  );

  const debouncedUpdateFilterParams = debounce(
    (columnFilters: FilterParam[]) => {
      if (!columnFilters || columnFilters.length === 0) {
        void setSearchParams.setFilterParams(null);
        router.refresh();
        return;
      }

      void setSearchParams.setFilterParams(columnFilters);
      router.refresh();
      // Changing the filter params should reset the page to 1
      // void setSearchParams.setPage(1);
    },
    2000,
    {
      trailing: true,
      leading: false,
    },
  );

  // Sync any changes to columnFilters back to searchParams
  React.useEffect(() => {
    // If we are resetting, skip the debounce
    if (!columnFilters || columnFilters.length === 0) {
      void setSearchParams.setFilterParams(null);
      router.refresh();
      return;
    }

    debouncedUpdateFilterParams(columnFilters as FilterParam[]);

    // Changing the filter params should reset the page to 1
    void setSearchParams.setPage(1);
    router.refresh();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [columnFilters]);

  React.useEffect(() => {
    setPagination({
      pageIndex: searchParams.page - 1,
      pageSize: searchParams.perPage,
    });
  }, [searchParams.page, searchParams.perPage]);

  React.useEffect(() => {
    void setSearchParams.setPage(pageIndex + 1);
    void setSearchParams.setPerPage(pageSize as PageSize);
    router.refresh();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageIndex, pageSize]);

  const [sorting, setSorting] = React.useState<SortingState>([
    {
      id: searchParams.sortField,
      desc: searchParams.sort === 'desc',
    },
  ]);

  React.useEffect(() => {
    void setSearchParams.setSort(sorting[0]?.desc ? 'desc' : 'asc');
    void setSearchParams.setSortField(sorting[0]?.id as SortableField);
    router.refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sorting]);

  const dataTable = useReactTable({
    data,
    columns,
    pageCount: pageCount ?? -1,
    state: {
      pagination,
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
  });

  return { dataTable };
}
