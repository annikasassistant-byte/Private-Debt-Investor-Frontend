"use client";

import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SearchInput } from "@/components/shared/search-input";
import { ChevronLeft, ChevronRight, Columns3, FileDown, FileText } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/shared/empty-state";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchKey?: string;
  searchPlaceholder?: string;
  showExport?: boolean;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey,
  searchPlaceholder,
  showExport = true,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [globalFilter, setGlobalFilter] = useState("");

  const table = useReactTable({
    data,
    columns,
    state: { sorting, columnFilters, columnVisibility, globalFilter },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: searchKey
      ? (row, _columnId, filterValue) => {
          const v = row.getValue(searchKey);
          return String(v ?? "")
            .toLowerCase()
            .includes(String(filterValue).toLowerCase());
        }
      : undefined,
  });

  const hasRows = table.getRowModel().rows.length > 0;

  return (
    <div className="space-y-4">
      <div
        className={cn(
          "flex flex-col gap-3 rounded-2xl border border-border/40 bg-muted/15 p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4",
          globalFilter && "ring-1 ring-primary/20"
        )}
      >
        <SearchInput
          value={globalFilter}
          onChange={setGlobalFilter}
          placeholder={searchPlaceholder ?? "Search..."}
          className="w-full sm:max-w-sm"
        />
        <div className="flex flex-wrap gap-2">
          {showExport && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl border-border/60 bg-background/80"
                onClick={() => toast.success("CSV export started (demo)")}
              >
                <FileDown className="mr-2 h-4 w-4" />
                CSV
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl border-border/60 bg-background/80"
                onClick={() => toast.success("PDF export started (demo)")}
              >
                <FileText className="mr-2 h-4 w-4" />
                PDF
              </Button>
            </>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "rounded-xl border-border/60 bg-background/80"
              )}
            >
              <Columns3 className="mr-2 h-4 w-4" />
              Columns
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl">
              {table
                .getAllColumns()
                .filter((col) => col.getCanHide())
                .map((col) => (
                  <DropdownMenuCheckboxItem
                    key={col.id}
                    checked={col.getIsVisible()}
                    onCheckedChange={(v) => col.toggleVisibility(!!v)}
                  >
                    {col.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {!hasRows ? (
        <EmptyState
          title="No matching records"
          description="Try adjusting your search or filters to find what you're looking for."
          actionLabel="Clear search"
          onAction={() => setGlobalFilter("")}
        />
      ) : (
        <div
          className="overflow-hidden rounded-2xl border border-border/40 bg-card/60 backdrop-blur-sm"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <div className="max-h-[min(560px,65vh)] overflow-auto">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-muted/90 backdrop-blur-md">
                {table.getHeaderGroups().map((hg) => (
                  <TableRow key={hg.id} className="border-border/40 hover:bg-transparent">
                    {hg.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        className="h-11 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="border-border/30 transition-colors duration-200 hover:bg-primary/[0.03]"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-3.5 text-sm tabular-financial">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3 rounded-2xl border border-border/30 bg-muted/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Page{" "}
          <span className="font-medium text-foreground">
            {table.getState().pagination.pageIndex + 1}
          </span>{" "}
          of <span className="font-medium text-foreground">{table.getPageCount() || 1}</span>
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
