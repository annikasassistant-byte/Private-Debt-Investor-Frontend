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
import { useEffect, useState } from "react";
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
  /** Optional investment id for authenticated CSV/PDF export via API */
  exportInvestmentId?: string;
  onExportCsv?: () => void | Promise<void>;
  onExportPdf?: () => void | Promise<void>;
  /**
   * Column ids kept visible below the `sm` breakpoint.
   * Other hideable columns are collapsed; user can still restore via Spalten.
   */
  mobileVisibleColumns?: string[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey,
  searchPlaceholder,
  showExport = true,
  exportInvestmentId,
  onExportCsv,
  onExportPdf,
  mobileVisibleColumns,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [globalFilter, setGlobalFilter] = useState("");
  const [isNarrow, setIsNarrow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(max-width: 639px)");
    const apply = () => setIsNarrow(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (!mobileVisibleColumns?.length) return;
    if (!isNarrow) {
      setColumnVisibility({});
      return;
    }
    const keep = new Set(mobileVisibleColumns);
    const next: VisibilityState = {};
    for (const col of columns) {
      const id =
        col.id ||
        ("accessorKey" in col && typeof col.accessorKey === "string"
          ? col.accessorKey
          : undefined);
      if (!id || id === "actions") continue;
      if (!keep.has(id)) next[id] = false;
    }
    setColumnVisibility(next);
  }, [isNarrow, mobileVisibleColumns, columns]);

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

  const handleExport = async (format: "csv" | "pdf") => {
    try {
      if (format === "csv" && onExportCsv) {
        await onExportCsv();
        return;
      }
      if (format === "pdf" && onExportPdf) {
        await onExportPdf();
        return;
      }
      if (exportInvestmentId) {
        const { exportPaymentsFile } = await import("@/lib/download");
        await exportPaymentsFile(exportInvestmentId, format);
        toast.success(`${format.toUpperCase()} heruntergeladen`);
        return;
      }
      // Client-side CSV fallback from visible rows
      if (format === "csv") {
        const rows = table.getFilteredRowModel().rows;
        if (!rows.length) {
          toast.message("Nichts zum Exportieren");
          return;
        }
        const keys = table
          .getAllColumns()
          .filter((c) => c.getIsVisible() && c.id !== "actions")
          .map((c) => c.id);
        const header = keys.join(",");
        const body = rows
          .map((row) =>
            keys
              .map((k) => {
                const val = row.getValue(k);
                const s = String(val ?? "");
                return s.includes(",") ? `"${s.replace(/"/g, '""')}"` : s;
              })
              .join(",")
          )
          .join("\n");
        const blob = new Blob([`${header}\n${body}`], { type: "text/csv;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "export.csv";
        a.click();
        URL.revokeObjectURL(url);
        toast.success("CSV heruntergeladen");
        return;
      }
      toast.message("Wählen Sie einen Investitions-Zahlungsplan für den PDF-Export");
    } catch {
      toast.error("Export fehlgeschlagen");
    }
  };

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
          placeholder={searchPlaceholder ?? "Suchen…"}
          className="w-full sm:max-w-sm"
        />
        <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-wrap">
          {showExport && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="min-h-10 rounded-xl border-border/60 bg-background/80 sm:min-h-8"
                onClick={() => handleExport("csv")}
              >
                <FileDown className="mr-2 h-4 w-4" />
                CSV
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="min-h-10 rounded-xl border-border/60 bg-background/80 sm:min-h-8"
                onClick={() => handleExport("pdf")}
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
                "min-h-10 rounded-xl border-border/60 bg-background/80 sm:min-h-8",
                showExport ? "col-span-2 sm:col-span-1" : "col-span-2"
              )}
            >
              <Columns3 className="mr-2 h-4 w-4" />
              Spalten
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
          title="Keine passenden Einträge"
          description="Passen Sie Ihre Suche oder Filter an, um passende Ergebnisse zu finden."
          actionLabel="Suche zurücksetzen"
          onAction={() => setGlobalFilter("")}
        />
      ) : (
        <div
          className="max-w-full rounded-2xl border border-border/40 bg-card/60 backdrop-blur-sm"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <p className="border-b border-border/30 px-3 py-1.5 text-[11px] text-muted-foreground sm:hidden">
            Wischen für weitere Spalten · Kernfelder bleiben sichtbar
          </p>
          <div className="max-h-[min(560px,65vh)] overflow-x-auto overflow-y-auto overscroll-x-contain [-webkit-overflow-scrolling:touch]">
            <Table className={cn(isNarrow ? "min-w-[360px]" : "min-w-[640px]")}>
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
          Seite{" "}
          <span className="font-medium text-foreground">
            {table.getState().pagination.pageIndex + 1}
          </span>{" "}
          von <span className="font-medium text-foreground">{table.getPageCount() || 1}</span>
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
            Zurück
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Weiter
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
