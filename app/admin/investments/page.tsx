"use client";

import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import type { Investment } from "@/types";
import { DataTable } from "@/components/tables/data-table";
import { formatCurrency, formatDate } from "@/lib/format";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Banknote, Pencil, Plus, Trash2, RefreshCw } from "lucide-react";
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
  useCreateInvestmentMutation,
  useDeleteInvestmentMutation,
  useEarlyRepaymentMutation,
  useGetInvestmentsQuery,
  useGetInvestorsQuery,
  useRegenerateScheduleMutation,
  useUpdateInvestmentMutation,
} from "@/services/domainApi";
import { getApiErrorMessage } from "@/services/auth-mappers";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { formatRepaymentModel, REPAYMENT_MODEL_OPTIONS } from "@/lib/repayment";

const emptyForm = {
  investorId: "",
  principal: "",
  interestRate: "",
  termMonths: "",
  paymentDay: "15",
  repaymentModel: "amortizing",
  borrower: "",
  startDate: new Date().toISOString().slice(0, 10),
};

export default function AdminInvestmentsPage() {
  const { data: rows = [], isLoading, isError, refetch } = useGetInvestmentsQuery();
  const { data: investors = [] } = useGetInvestorsQuery();
  const [createInvestment, { isLoading: creating }] = useCreateInvestmentMutation();
  const [updateInvestment, { isLoading: updating }] = useUpdateInvestmentMutation();
  const [earlyRepayment, { isLoading: repaying }] = useEarlyRepaymentMutation();
  const [deleteInvestment] = useDeleteInvestmentMutation();
  const [regenerateSchedule] = useRegenerateScheduleMutation();
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [earlyOpen, setEarlyOpen] = useState(false);
  const [editing, setEditing] = useState<Investment | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [editForm, setEditForm] = useState({
    principal: "",
    interestRate: "",
    termMonths: "",
    paymentDay: "15",
    repaymentModel: "amortizing",
    status: "active",
    notes: "",
  });
  const [earlyForm, setEarlyForm] = useState({ amount: "", interestPortion: "", notes: "" });

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
        header: "Financing Fee",
        cell: ({ row }) => `${row.original.interestRate}%`,
      },
      {
        accessorKey: "repaymentModel",
        header: "Model",
        cell: ({ row }) => formatRepaymentModel(row.original.repaymentModel),
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
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex justify-end gap-1">
            <Button
              variant="ghost"
              size="icon"
              title="Edit"
              onClick={() => {
                const inv = row.original;
                setEditing(inv);
                setEditForm({
                  principal: String(inv.principal),
                  interestRate: String(inv.interestRate),
                  termMonths: String(inv.termMonths),
                  paymentDay: String(inv.paymentDay || 15),
                  repaymentModel: inv.repaymentModel || "amortizing",
                  status: inv.status,
                  notes: "",
                });
                setEditOpen(true);
              }}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              title="Early repayment"
              onClick={() => {
                setEditing(row.original);
                setEarlyForm({
                  amount: String(row.original.outstandingBalance || ""),
                  interestPortion: "",
                  notes: "",
                });
                setEarlyOpen(true);
              }}
            >
              <Banknote className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              title="Regenerate schedule"
              onClick={async () => {
                try {
                  await regenerateSchedule(row.original.id).unwrap();
                  toast.success("Schedule regenerated");
                } catch (error) {
                  toast.error(getApiErrorMessage(error, "Unable to regenerate"));
                }
              }}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={async () => {
                try {
                  await deleteInvestment(row.original.id).unwrap();
                  toast.success("Investment removed");
                } catch (error) {
                  toast.error(getApiErrorMessage(error, "Unable to delete"));
                }
              }}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ),
      },
    ],
    [deleteInvestment, regenerateSchedule]
  );

  if (isLoading) return <LoadingSkeleton variant="page" />;
  if (isError) {
    return (
      <EmptyState
        title="Unable to load investments"
        description="Check your connection and try again."
        actionLabel="Retry"
        onAction={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Investments</h1>
          <p className="text-sm text-muted-foreground">
            Create positions and manage repayment schedules.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger className={cn(buttonVariants())}>
            <Plus className="mr-2 h-4 w-4" />
            Create investment
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Create investment</DialogTitle>
            </DialogHeader>
            <div className="grid gap-3 py-2">
              <div className="space-y-2">
                <Label>Investor</Label>
                <Select
                  value={form.investorId}
                  onValueChange={(v) => setForm((f) => ({ ...f, investorId: v || "" }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select investor" />
                  </SelectTrigger>
                  <SelectContent>
                    {investors.map((inv) => (
                      <SelectItem key={inv.id} value={inv.id}>
                        {inv.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {(
                [
                  ["principal", "Principal"],
                  ["interestRate", "Financing Fee (%)"],
                  ["termMonths", "Term (months)"],
                  ["paymentDay", "Payment day (1–31)"],
                  ["startDate", "Start date"],
                  ["borrower", "Borrower (optional — creates loan)"],
                ] as const
              ).map(([key, label]) => (
                <div key={key} className="space-y-2">
                  <Label>{label}</Label>
                  <Input
                    type={key === "startDate" ? "date" : key === "borrower" ? "text" : "number"}
                    value={form[key]}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  />
                </div>
              ))}
              <div className="space-y-2">
                <Label>Repayment model</Label>
                <Select
                  value={form.repaymentModel}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, repaymentModel: v || "amortizing" }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {REPAYMENT_MODEL_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                disabled={creating}
                onClick={async () => {
                  try {
                    await createInvestment({
                      investorId: form.investorId,
                      principal: Number(form.principal),
                      interestRate: Number(form.interestRate),
                      termMonths: Number(form.termMonths),
                      paymentDay: Number(form.paymentDay),
                      repaymentModel: form.repaymentModel,
                      startDate: form.startDate,
                      ...(form.borrower ? { borrower: form.borrower } : {}),
                    }).unwrap();
                    toast.success("Investment created");
                    setOpen(false);
                    setForm(emptyForm);
                  } catch (error) {
                    toast.error(getApiErrorMessage(error, "Unable to create investment"));
                  }
                }}
              >
                {creating ? "Saving…" : "Save"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit investment</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            {(
              [
                ["principal", "Principal"],
                ["interestRate", "Financing Fee (%)"],
                ["termMonths", "Term (months)"],
                ["paymentDay", "Payment day (1–31)"],
              ] as const
            ).map(([key, label]) => (
              <div key={key} className="space-y-2">
                <Label>{label}</Label>
                <Input
                  type="number"
                  value={editForm[key]}
                  onChange={(e) => setEditForm((f) => ({ ...f, [key]: e.target.value }))}
                />
              </div>
            ))}
            <div className="space-y-2">
              <Label>Repayment model</Label>
              <Select
                value={editForm.repaymentModel}
                onValueChange={(v) =>
                  setEditForm((f) => ({ ...f, repaymentModel: v || "amortizing" }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REPAYMENT_MODEL_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={editForm.status}
                onValueChange={(v) => setEditForm((f) => ({ ...f, status: v || "active" }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["pending", "active", "matured", "closed"].map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <p className="text-xs text-muted-foreground">
              Changing principal, rate, term, payment day, or model regenerates unpaid schedule rows.
            </p>
          </div>
          <DialogFooter>
            <Button
              disabled={updating || !editing}
              onClick={async () => {
                if (!editing) return;
                try {
                  await updateInvestment({
                    id: editing.id,
                    body: {
                      principal: Number(editForm.principal),
                      interestRate: Number(editForm.interestRate),
                      termMonths: Number(editForm.termMonths),
                      paymentDay: Number(editForm.paymentDay),
                      repaymentModel: editForm.repaymentModel,
                      status: editForm.status,
                    },
                  }).unwrap();
                  toast.success("Investment updated");
                  setEditOpen(false);
                  setEditing(null);
                } catch (error) {
                  toast.error(getApiErrorMessage(error, "Unable to update"));
                }
              }}
            >
              {updating ? "Saving…" : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={earlyOpen} onOpenChange={setEarlyOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Early repayment</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <p className="text-sm text-muted-foreground">
              Outstanding: {editing ? formatCurrency(editing.outstandingBalance) : "—"}
            </p>
            <div className="space-y-2">
              <Label>Amount</Label>
              <Input
                type="number"
                value={earlyForm.amount}
                onChange={(e) => setEarlyForm((f) => ({ ...f, amount: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Financing Fee portion (optional)</Label>
              <Input
                type="number"
                value={earlyForm.interestPortion}
                onChange={(e) => setEarlyForm((f) => ({ ...f, interestPortion: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Input
                value={earlyForm.notes}
                onChange={(e) => setEarlyForm((f) => ({ ...f, notes: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              disabled={repaying || !editing}
              onClick={async () => {
                if (!editing) return;
                try {
                  await earlyRepayment({
                    id: editing.id,
                    body: {
                      amount: Number(earlyForm.amount),
                      ...(earlyForm.interestPortion
                        ? { interestPortion: Number(earlyForm.interestPortion) }
                        : {}),
                      ...(earlyForm.notes ? { notes: earlyForm.notes } : {}),
                    },
                  }).unwrap();
                  toast.success("Early repayment applied");
                  setEarlyOpen(false);
                  setEditing(null);
                } catch (error) {
                  toast.error(getApiErrorMessage(error, "Unable to apply early repayment"));
                }
              }}
            >
              {repaying ? "Applying…" : "Apply repayment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {rows.length === 0 ? (
        <EmptyState
          title="No investments yet"
          description="Create the first investment to generate a repayment schedule."
        />
      ) : (
        <DataTable
          columns={columns}
          data={rows}
          searchKey="investorName"
          exportInvestmentId={rows[0]?.id}
        />
      )}
    </div>
  );
}
