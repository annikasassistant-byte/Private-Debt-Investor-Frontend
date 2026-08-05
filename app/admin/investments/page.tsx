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
import { selectItems } from "@/lib/select-items";

const emptyForm = {
  investorId: "",
  principal: "",
  interestRate: "",
  termMonths: "",
  paymentDay: "15",
  repaymentModel: "amortizing",
  borrower: "",
  startDate: new Date().toISOString().slice(0, 10),
  gracePeriodMonths: "0",
  balloonAmount: "0",
};

const statusLabels: Record<string, string> = {
  pending: "Ausstehend",
  active: "Aktiv",
  matured: "Fällig",
  closed: "Geschlossen",
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
    gracePeriodMonths: "0",
    balloonAmount: "0",
  });
  const [earlyForm, setEarlyForm] = useState({ amount: "", interestPortion: "", notes: "" });

  const columns: ColumnDef<Investment>[] = useMemo(
    () => [
      { accessorKey: "investorName", header: "Investor" },
      {
        accessorKey: "principal",
        header: "Hauptsumme",
        cell: ({ row }) => formatCurrency(row.original.principal),
      },
      {
        accessorKey: "interestRate",
        header: "Finanzierungsgebühr",
        cell: ({ row }) => `${row.original.interestRate}%`,
      },
      {
        accessorKey: "repaymentModel",
        header: "Modell",
        cell: ({ row }) => formatRepaymentModel(row.original.repaymentModel),
      },
      { accessorKey: "termMonths", header: "Laufzeit (Mon.)" },
      {
        accessorKey: "outstandingBalance",
        header: "Offener Saldo",
        cell: ({ row }) => formatCurrency(row.original.outstandingBalance),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        accessorKey: "maturityDate",
        header: "Fälligkeit",
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
              title="Bearbeiten"
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
                  gracePeriodMonths: String(inv.gracePeriodMonths ?? 0),
                  balloonAmount: String(inv.balloonAmount ?? 0),
                });
                setEditOpen(true);
              }}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              title="Vorzeitige Rückzahlung"
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
              title="Tilgungsplan neu erzeugen"
              onClick={async () => {
                try {
                  await regenerateSchedule(row.original.id).unwrap();
                  toast.success("Tilgungsplan neu erzeugt");
                } catch (error) {
                  toast.error(getApiErrorMessage(error, "Konnte nicht neu erzeugt werden"));
                }
              }}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              title="Investition löschen"
              onClick={async () => {
                const ok = window.confirm(
                  "Investition wirklich löschen?\n\nZugehörige Zahlungen und Zeitachsen-Ereignisse werden entfernt. Dieser Vorgang kann nicht rückgängig gemacht werden."
                );
                if (!ok) return;
                try {
                  await deleteInvestment(row.original.id).unwrap();
                  toast.success("Investition entfernt");
                } catch (error) {
                  toast.error(getApiErrorMessage(error, "Konnte nicht gelöscht werden"));
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
        title="Investitionen konnten nicht geladen werden"
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
          <h1 className="text-2xl font-semibold tracking-tight">Investitionen</h1>
          <p className="text-sm text-muted-foreground">
            Positionen anlegen und Tilgungspläne verwalten.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger className={cn(buttonVariants())}>
            <Plus className="mr-2 h-4 w-4" />
            Investition anlegen
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Investition anlegen</DialogTitle>
            </DialogHeader>
            <div className="grid gap-3 py-2">
              <div className="space-y-2">
                <Label>Investor</Label>
                <Select
                  value={form.investorId}
                  onValueChange={(v) => setForm((f) => ({ ...f, investorId: v || "" }))}
                  items={selectItems(investors.map((inv) => ({ value: inv.id, label: inv.name })))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Investor auswählen" />
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
                  ["principal", "Hauptsumme"],
                  ["interestRate", "Finanzierungsgebühr (%)"],
                  ["termMonths", "Laufzeit (Monate)"],
                  ["paymentDay", "Zahlungstag (1–31)"],
                  ["startDate", "Startdatum"],
                  ["borrower", "Kreditnehmer (optional — legt Kredit an)"],
                  ["gracePeriodMonths", "tilgungsfreie Monate (optional)"],
                  ["balloonAmount", "Schlussrate / Balloon (€, optional)"],
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
              <p className="text-xs text-muted-foreground">
                Tilgungsfreie Monate: nur Finanzierungsgebühr. Schlussrate wird bei Annuität berücksichtigt.
                Nicht verfügbar für „Feste Monatsrate“.
              </p>
              <div className="space-y-2">
                <Label>Rückzahlungsmodell</Label>
                <Select
                  value={form.repaymentModel}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, repaymentModel: v || "amortizing" }))
                  }
                  items={selectItems(
                    REPAYMENT_MODEL_OPTIONS.map((opt) => ({
                      value: opt.value,
                      label: opt.label,
                    }))
                  )}
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
                      gracePeriodMonths: Number(form.gracePeriodMonths || 0),
                      balloonAmount: Number(form.balloonAmount || 0),
                      ...(form.borrower ? { borrower: form.borrower } : {}),
                    }).unwrap();
                    toast.success("Investition angelegt");
                    setOpen(false);
                    setForm(emptyForm);
                  } catch (error) {
                    toast.error(getApiErrorMessage(error, "Investition konnte nicht angelegt werden"));
                  }
                }}
              >
                {creating ? "Speichern…" : "Speichern"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Investition bearbeiten</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            {(
              [
                ["principal", "Hauptsumme"],
                ["interestRate", "Finanzierungsgebühr (%)"],
                ["termMonths", "Laufzeit (Monate)"],
                ["paymentDay", "Zahlungstag (1–31)"],
                ["gracePeriodMonths", "tilgungsfreie Monate"],
                ["balloonAmount", "Schlussrate / Balloon (€)"],
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
              <Label>Rückzahlungsmodell</Label>
              <Select
                value={editForm.repaymentModel}
                onValueChange={(v) =>
                  setEditForm((f) => ({ ...f, repaymentModel: v || "amortizing" }))
                }
                items={selectItems(
                  REPAYMENT_MODEL_OPTIONS.map((opt) => ({
                    value: opt.value,
                    label: opt.label,
                  }))
                )}
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
                items={selectItems(
                  ["pending", "active", "matured", "closed"].map((s) => ({
                    value: s,
                    label: statusLabels[s] || s,
                  }))
                )}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["pending", "active", "matured", "closed"].map((s) => (
                    <SelectItem key={s} value={s}>
                      {statusLabels[s] || s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <p className="text-xs text-muted-foreground">
              Änderungen an Hauptsumme, Satz, Laufzeit, Zahlungstag, Modell, tilgungsfreien Monaten
              oder Schlussrate erzeugen unbezahlte Planzeilen neu.
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
                      gracePeriodMonths: Number(editForm.gracePeriodMonths || 0),
                      balloonAmount: Number(editForm.balloonAmount || 0),
                    },
                  }).unwrap();
                  toast.success("Investition aktualisiert");
                  setEditOpen(false);
                  setEditing(null);
                } catch (error) {
                  toast.error(getApiErrorMessage(error, "Konnte nicht aktualisiert werden"));
                }
              }}
            >
              {updating ? "Speichern…" : "Änderungen speichern"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={earlyOpen} onOpenChange={setEarlyOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Vorzeitige Rückzahlung</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <p className="text-sm text-muted-foreground">
              Offener Saldo: {editing ? formatCurrency(editing.outstandingBalance) : "—"}
            </p>
            <div className="space-y-2">
              <Label>Betrag</Label>
              <Input
                type="number"
                value={earlyForm.amount}
                onChange={(e) => setEarlyForm((f) => ({ ...f, amount: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Anteil Finanzierungsgebühr (optional)</Label>
              <Input
                type="number"
                value={earlyForm.interestPortion}
                onChange={(e) => setEarlyForm((f) => ({ ...f, interestPortion: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Notizen</Label>
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
                  toast.success("Vorzeitige Rückzahlung verbucht");
                  setEarlyOpen(false);
                  setEditing(null);
                } catch (error) {
                  toast.error(getApiErrorMessage(error, "Vorzeitige Rückzahlung konnte nicht verbucht werden"));
                }
              }}
            >
              {repaying ? "Wird verbucht…" : "Rückzahlung verbuchen"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {rows.length === 0 ? (
        <EmptyState
          title="Noch keine Investitionen"
          description="Legen Sie die erste Investition an, um einen Tilgungsplan zu erzeugen."
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
