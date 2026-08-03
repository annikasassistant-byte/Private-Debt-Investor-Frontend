"use client";

import { useState } from "react";
import { DocumentCard } from "@/components/documents/document-card";
import { InvestorMultiSelect } from "@/components/documents/investor-multi-select";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import {
  useCreateReportMutation,
  useDeleteReportMutation,
  useGetInvestorsQuery,
  useGetReportsQuery,
} from "@/services/domainApi";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { getApiErrorMessage } from "@/services/auth-mappers";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const categoryLabels: Record<string, string> = {
  monthly: "Monatlich",
  quarterly: "Quartalsweise",
  annual: "Jährlich",
  kpi: "KPI",
  other: "Sonstiges",
};

export default function AdminReportsPage() {
  const { data: reports = [], isLoading, isError, refetch } = useGetReportsQuery();
  const { data: investors = [] } = useGetInvestorsQuery();
  const [createReport, { isLoading: uploading }] = useCreateReportMutation();
  const [deleteReport] = useDeleteReportMutation();
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("other");
  const [period, setPeriod] = useState("");
  const [investorIds, setInvestorIds] = useState<string[]>([]);

  if (isLoading) return <LoadingSkeleton variant="page" />;
  if (isError) {
    return (
      <EmptyState
        title="Berichte konnten nicht geladen werden"
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
          <h1 className="text-2xl font-semibold tracking-tight">Finanzberichte</h1>
          <p className="text-sm text-muted-foreground">Berichte hochladen und Investoren zuweisen.</p>
        </div>
        <button type="button" className={cn(buttonVariants())} onClick={() => setOpen(true)}>
          <Upload className="mr-2 h-4 w-4" />
          Bericht hochladen
        </button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bericht hochladen</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="space-y-2">
              <Label>Datei</Label>
              <Input
                type="file"
                accept=".pdf,.doc,.docx,.xls,.xlsx,image/*"
                onChange={(e) => {
                  const f = e.target.files?.[0] || null;
                  setFile(f);
                  if (f && !title) setTitle(f.name);
                }}
              />
            </div>
            <div className="space-y-2">
              <Label>Titel</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Kategorie</Label>
              <Select value={category} onValueChange={(v) => setCategory(v || "other")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["monthly", "quarterly", "annual", "kpi", "other"].map((c) => (
                    <SelectItem key={c} value={c}>
                      {categoryLabels[c] || c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Zeitraum</Label>
              <Input
                placeholder="z. B. Q1 2026"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
              />
            </div>
            <InvestorMultiSelect
              investors={investors.map((i) => ({ id: i.id, name: i.name }))}
              selectedIds={investorIds}
              onChange={setInvestorIds}
            />
          </div>
          <DialogFooter>
            <Button
              disabled={uploading || !file || !title}
              onClick={async () => {
                if (!file) return;
                const fd = new FormData();
                fd.append("title", title);
                fd.append("category", category);
                fd.append("period", period);
                fd.append("file", file);
                if (investorIds.length) {
                  fd.append("assignedInvestors", JSON.stringify(investorIds));
                }
                try {
                  await createReport(fd).unwrap();
                  toast.success("Bericht hochgeladen");
                  setOpen(false);
                  setFile(null);
                  setTitle("");
                  setPeriod("");
                  setInvestorIds([]);
                } catch (error) {
                  toast.error(getApiErrorMessage(error, "Upload fehlgeschlagen"));
                }
              }}
            >
              {uploading ? "Wird hochgeladen…" : "Hochladen"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {reports.length === 0 ? (
        <EmptyState title="Keine Berichte" description="Laden Sie den ersten Finanzbericht hoch." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {reports.map((r) => (
            <DocumentCard
              key={r.id}
              title={r.title}
              meta={`${r.period || "—"} · ${r.size}`}
              badge={categoryLabels[r.category] || r.category}
              downloadPath={`/reports/${r.id}/download`}
              onDelete={async () => {
                await deleteReport(r.id).unwrap();
                toast.success("Bericht gelöscht");
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
