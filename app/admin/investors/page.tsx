"use client";

import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import type { Investor } from "@/types";
import { DataTable } from "@/components/tables/data-table";
import { formatCurrency, formatDate } from "@/lib/format";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
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
import {
  useCreateInvestorMutation,
  useDeleteInvestorMutation,
  useGetInvestorsQuery,
} from "@/services/domainApi";
import { getApiErrorMessage } from "@/services/auth-mappers";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { EmptyState } from "@/components/shared/empty-state";

export default function AdminInvestorsPage() {
  const { data: rows = [], isLoading } = useGetInvestorsQuery();
  const [createInvestor, { isLoading: creating }] = useCreateInvestorMutation();
  const [deleteInvestor] = useDeleteInvestorMutation();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    company: "",
  });

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
              onClick={async () => {
                try {
                  await deleteInvestor(row.original.id).unwrap();
                  toast.success("Investor removed");
                } catch (error) {
                  toast.error(getApiErrorMessage(error, "Unable to delete investor"));
                }
              }}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ),
      },
    ],
    [deleteInvestor]
  );

  if (isLoading) return <LoadingSkeleton variant="page" />;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Investors</h1>
          <p className="text-sm text-muted-foreground">Manage investor accounts and allocations.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger className={cn(buttonVariants())}>
            <Plus className="mr-2 h-4 w-4" />
            Create investor
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create investor</DialogTitle>
            </DialogHeader>
            <div className="grid gap-3 py-2">
              {(
                [
                  ["name", "Full name"],
                  ["email", "Email"],
                  ["password", "Temp password"],
                  ["phone", "Phone"],
                  ["company", "Company"],
                ] as const
              ).map(([key, label]) => (
                <div key={key} className="space-y-2">
                  <Label>{label}</Label>
                  <Input
                    type={key === "password" ? "password" : key === "email" ? "email" : "text"}
                    value={form[key]}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  />
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button
                disabled={creating}
                onClick={async () => {
                  try {
                    await createInvestor(form).unwrap();
                    toast.success("Investor created");
                    setOpen(false);
                    setForm({ name: "", email: "", password: "", phone: "", company: "" });
                  } catch (error) {
                    toast.error(getApiErrorMessage(error, "Unable to create investor"));
                  }
                }}
              >
                {creating ? "Saving…" : "Save"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      {rows.length === 0 ? (
        <EmptyState title="No investors yet" description="Create the first investor to get started." />
      ) : (
        <DataTable
          columns={columns}
          data={rows}
          searchKey="name"
          searchPlaceholder="Search investors..."
        />
      )}
    </div>
  );
}
