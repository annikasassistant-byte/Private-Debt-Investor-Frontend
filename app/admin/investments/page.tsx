"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { Investment } from "@/types";
import { DataTable } from "@/components/tables/data-table";
import { formatCurrency, formatDate } from "@/lib/format";
import { StatusBadge } from "@/components/shared/status-badge";
import { useMemo } from "react";
import { useGetInvestmentsQuery } from "@/services/domainApi";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";

export default function AdminInvestmentsPage() {
  const { data: rows = [], isLoading } = useGetInvestmentsQuery();
  const columns: ColumnDef<Investment>[] = useMemo(
    () => [
      { accessorKey: "investorName", header: "Investor" },
      {
        accessorKey: "principal",
        header: "Principal",
        cell: ({ row }) => formatCurrency(row.original.principal),
      },
      {
        accessorKey: "interestRate",
        header: "Rate",
        cell: ({ row }) => `${row.original.interestRate}%`,
      },
      { accessorKey: "termMonths", header: "Term (mo)" },
      {
        accessorKey: "outstandingBalance",
        header: "Outstanding",
        cell: ({ row }) => formatCurrency(row.original.outstandingBalance),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        accessorKey: "maturityDate",
        header: "Maturity",
        cell: ({ row }) => formatDate(row.original.maturityDate),
      },
    ],
    []
  );

  if (isLoading) return <LoadingSkeleton variant="page" />;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Investments</h1>
        <p className="text-sm text-muted-foreground">All active and historical investment positions.</p>
      </div>
      <DataTable columns={columns} data={rows} searchKey="investorName" />
    </div>
  );
}
