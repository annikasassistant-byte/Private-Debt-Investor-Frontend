"use client";

import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import type { Loan } from "@/types";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  useCreateLoanMutation,
  useDeleteLoanMutation,
  useGetInvestmentsQuery,
  useGetLoansQuery,
} from "@/services/domainApi";
import { getApiErrorMessage } from "@/services/auth-mappers";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { EmptyState } from "@/components/shared/empty-state";

export default function AdminLoansPage() {
  const { data: rows = [], isLoading, isError, refetch } = useGetLoansQuery();
  const { data: investments = [] } = useGetInvestmentsQuery();
  const [createLoan, { isLoading: creating }] = useCreateLoanMutation();
  const [deleteLoan] = useDeleteLoanMutation();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    investmentId: "",
    borrower: "",
    amount: "",
    rate: "",
  });

  const columns: ColumnDef<Loan>[] = useMemo(
    () => [
      { accessorKey: "borrower", header: "Kreditnehmer" },
      {
        accessorKey: "amount",
        header: "Betrag",
        cell: ({ row }) => formatCurrency(row.original.amount),
      },
      {
        accessorKey: "rate",
        header: "Satz",
        cell: ({ row }) => `${row.original.rate}%`,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        accessorKey: "fundedAt",
        header: "Ausgezahlt",
        cell: ({ row }) => formatDate(row.original.fundedAt),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="icon"
              onClick={async () => {
                try {
                  await deleteLoan(row.original.id).unwrap();
                  toast.success("Kredit entfernt");
                } catch (error) {
                  toast.error(getApiErrorMessage(error, "Kredit konnte nicht gelöscht werden"));
                }
              }}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ),
      },
    ],
    [deleteLoan]
  );

  if (isLoading) return <LoadingSkeleton variant="page" />;
  if (isError) {
    return (
      <EmptyState
        title="Kredite konnten nicht geladen werden"
        description="Prüfen Sie Ihre Verbindung und versuchen Sie es erneut."
        actionLabel="Erneut versuchen"
        onAction={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Kredite</h1>
          <p className="text-sm text-muted-foreground">
            Zugrunde liegende Kreditfazilitäten, verknüpft mit Investitionen.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger className={cn(buttonVariants())}>
            <Plus className="mr-2 h-4 w-4" />
            Kredit anlegen
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Kredit anlegen</DialogTitle>
            </DialogHeader>
            <div className="grid gap-3 py-2">
              <div className="space-y-2">
                <Label>Investition</Label>
                <Select
                  value={form.investmentId}
                  onValueChange={(v) => setForm((f) => ({ ...f, investmentId: v || "" }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Investition auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {investments.map((inv) => (
                      <SelectItem key={inv.id} value={inv.id}>
                        {inv.investorName} — {formatCurrency(inv.principal)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Kreditnehmer</Label>
                <Input
                  value={form.borrower}
                  onChange={(e) => setForm((f) => ({ ...f, borrower: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Betrag (optional)</Label>
                <Input
                  type="number"
                  value={form.amount}
                  onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Satz % (optional)</Label>
                <Input
                  type="number"
                  value={form.rate}
                  onChange={(e) => setForm((f) => ({ ...f, rate: e.target.value }))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                disabled={creating}
                onClick={async () => {
                  try {
                    await createLoan({
                      investmentId: form.investmentId,
                      borrower: form.borrower,
                      ...(form.amount ? { amount: Number(form.amount) } : {}),
                      ...(form.rate ? { rate: Number(form.rate) } : {}),
                    }).unwrap();
                    toast.success("Kredit angelegt");
                    setOpen(false);
                    setForm({ investmentId: "", borrower: "", amount: "", rate: "" });
                  } catch (error) {
                    toast.error(getApiErrorMessage(error, "Kredit konnte nicht angelegt werden"));
                  }
                }}
              >
                {creating ? "Speichern…" : "Speichern"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      {rows.length === 0 ? (
        <EmptyState title="Noch keine Kredite" description="Legen Sie einen Kredit an, der mit einer Investition verknüpft ist." />
      ) : (
        <DataTable columns={columns} data={rows} searchKey="borrower" showExport={false} />
      )}
    </div>
  );
}
