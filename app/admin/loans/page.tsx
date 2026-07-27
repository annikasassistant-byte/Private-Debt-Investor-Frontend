"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { mockLoans } from "@/mock-data/loans";
import type { Loan } from "@/types";
import { DataTable } from "@/components/tables/data-table";
import { formatCurrency, formatDate } from "@/lib/format";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { useMemo } from "react";
import { toast } from "sonner";

export default function AdminLoansPage() {
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
      {
        id: "details",
        header: "",
        cell: ({ row }) => (
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.message(`Loan ${row.original.id} details (demo)`)}
          >
            Details
          </Button>
        ),
      },
    ],
    []
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Loans</h1>
        <p className="text-sm text-muted-foreground">Underlying borrower facilities.</p>
      </div>
      <DataTable columns={columns} data={mockLoans} searchKey="borrower" />
    </div>
  );
}
