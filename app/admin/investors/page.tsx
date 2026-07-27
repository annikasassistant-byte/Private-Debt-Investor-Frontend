"use client";

import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { mockInvestors } from "@/mock-data/investors";
import type { Investor } from "@/types";
import { DataTable } from "@/components/tables/data-table";
import { formatCurrency, formatDate } from "@/lib/format";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function AdminInvestorsPage() {
  const [rows, setRows] = useState(mockInvestors);

  const columns: ColumnDef<Investor>[] = useMemo(
    () => [
      { accessorKey: "name", header: "Name" },
      { accessorKey: "email", header: "Email" },
      { accessorKey: "company", header: "Company" },
      {
        accessorKey: "totalInvested",
        header: "Invested",
        cell: ({ row }) => formatCurrency(row.original.totalInvested),
      },
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
        accessorKey: "joinedAt",
        header: "Joined",
        cell: ({ row }) => formatDate(row.original.joinedAt),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex justify-end gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => toast.message(`Edit ${row.original.name} (demo)`)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setRows((prev) => prev.filter((i) => i.id !== row.original.id));
                toast.success("Investor removed (demo)");
              }}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ),
      },
    ],
    []
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Investors</h1>
          <p className="text-sm text-muted-foreground">Manage investor accounts and allocations.</p>
        </div>
        <Dialog>
          <DialogTrigger className={cn(buttonVariants())}>
            <Plus className="mr-2 h-4 w-4" />
            Create investor
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create investor</DialogTitle>
            </DialogHeader>
            <div className="grid gap-3 py-2">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input placeholder="Full name" />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" placeholder="email@company.com" />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => toast.success("Investor created (demo)")}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <DataTable columns={columns} data={rows} searchKey="name" searchPlaceholder="Search investors..." />
    </div>
  );
}
