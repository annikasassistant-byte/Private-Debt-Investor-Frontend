"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { Payment } from "@/types";
import { formatCurrency, formatCurrencyPrecise, formatDate } from "@/lib/format";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";

export const paymentColumns: ColumnDef<Payment>[] = [
  {
    accessorKey: "dueDate",
    header: ({ column }) => (
      <Button variant="ghost" size="sm" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Due Date
        <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
      </Button>
    ),
    cell: ({ row }) => formatDate(row.original.dueDate),
  },
  {
    accessorKey: "paymentDate",
    header: "Payment Date",
    cell: ({ row }) =>
      row.original.paymentDate ? formatDate(row.original.paymentDate) : "—",
  },
  {
    accessorKey: "principal",
    header: "Principal",
    cell: ({ row }) => formatCurrencyPrecise(row.original.principal),
  },
  {
    accessorKey: "interest",
    header: "Interest",
    cell: ({ row }) => formatCurrencyPrecise(row.original.interest),
  },
  {
    accessorKey: "total",
    header: "Total Payment",
    cell: ({ row }) => formatCurrencyPrecise(row.original.total),
  },
  {
    accessorKey: "remainingBalance",
    header: "Remaining Balance",
    cell: ({ row }) => formatCurrency(row.original.remainingBalance),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
];
