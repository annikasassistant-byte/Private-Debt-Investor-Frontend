"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { Payment } from "@/types";
import { formatCurrency, formatCurrencyPrecise, formatDate } from "@/lib/format";
import { localizeDateAdjustmentNote } from "@/lib/investment-status";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";

export const paymentColumns: ColumnDef<Payment>[] = [
  {
    accessorKey: "dueDate",
    header: ({ column }) => (
      <Button variant="ghost" size="sm" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Geplante Fälligkeit
        <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
      </Button>
    ),
    cell: ({ row }) => {
      const p = row.original;
      const note = localizeDateAdjustmentNote(p.dateAdjustmentNote);
      return (
        <div>
          <div>{formatDate(p.dueDate)}</div>
          {note ? (
            <div className="max-w-[180px] truncate text-[11px] text-muted-foreground" title={note}>
              {note}
            </div>
          ) : p.contractualDueDate && p.contractualDueDate !== p.dueDate ? (
            <div className="text-[11px] text-muted-foreground">
              Vertraglich {formatDate(p.contractualDueDate)}
            </div>
          ) : null}
        </div>
      );
    },
  },
  {
    accessorKey: "paymentDate",
    header: "Tatsächliche Zahlung",
    cell: ({ row }) =>
      row.original.paymentDate ? formatDate(row.original.paymentDate) : "—",
  },
  {
    accessorKey: "principal",
    header: "Tilgung",
    cell: ({ row }) => formatCurrencyPrecise(row.original.principal),
  },
  {
    accessorKey: "interest",
    header: "Finanzierungsgebühr",
    cell: ({ row }) => formatCurrencyPrecise(row.original.interest),
  },
  {
    accessorKey: "total",
    header: "Gesamtzahlung",
    cell: ({ row }) => formatCurrencyPrecise(row.original.total),
  },
  {
    accessorKey: "remainingBalance",
    header: "Restsaldo",
    cell: ({ row }) => formatCurrency(row.original.remainingBalance),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
];
