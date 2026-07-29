"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { Loan } from "@/types";
import { DataTable } from "@/components/tables/data-table";
import { formatCurrency, formatDate } from "@/lib/format";
import { StatusBadge } from "@/components/shared/status-badge";
import { useMemo } from "react";
import { useGetLoansQuery } from "@/services/domainApi";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";

export default function AdminLoansPage() {
  const { data: rows = [], isLoading } = useGetLoansQuery();
  const columns: ColumnDef<Loan>[] = useMemo(
    () => [
      { accessorKey: "borrower", header: "Borrower" },
      {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ row }) => formatCurrency(row.original.amount),
      },
      {
        accessorKey: "rate",
        header: "Rate",
        cell: ({ row }) => `${row.original.rate}%`,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        accessorKey: "fundedAt",
        header: "Funded",
        cell: ({ row }) => formatDate(row.original.fundedAt),
      },
    ],
    []
  );

  if (isLoading) return <LoadingSkeleton variant="page" />;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Loans</h1>
        <p className="text-sm text-muted-foreground">Underlying loan facilities linked to investments.</p>
      </div>
      <DataTable columns={columns} data={rows} searchKey="borrower" />
    </div>
  );
}
