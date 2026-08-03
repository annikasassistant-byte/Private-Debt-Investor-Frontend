"use client";

import { useState } from "react";
import { DocumentCard } from "@/components/documents/document-card";
import { InvestorMultiSelect } from "@/components/documents/investor-multi-select";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import {
  useCreateContractMutation,
  useDeleteContractMutation,
  useGetContractsQuery,
  useGetInvestorsQuery,
} from "@/services/domainApi";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { getApiErrorMessage } from "@/services/auth-mappers";
import { buttonVariants, Button } from "@/components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const contractTypeLabels: Record<string, string> = {
  loan_agreement: "Kreditvertrag",
  subordinated_loan: "Nachrangdarlehen",
  amendment: "Nachtrag",
  additional: "Zusätzlich",
};

export default function AdminContractsPage() {
  const { data: contracts = [], isLoading, isError, refetch } = useGetContractsQuery();
  const { data: investors = [] } = useGetInvestorsQuery();
  const [createContract, { isLoading: uploading }] = useCreateContractMutation();
  const [deleteContract] = useDeleteContractMutation();
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [type, setType] = useState("loan_agreement");
  const [investorIds, setInvestorIds] = useState<string[]>([]);

  if (isLoading) return <LoadingSkeleton variant="page" />;
  if (isError) {
    return (
      <EmptyState
        title="Verträge konnten nicht geladen werden"
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
          <h1 className="text-2xl font-semibold tracking-tight">Verträge</h1>
          <p className="text-sm text-muted-foreground">Vereinbarungen verwalten und Investoren zuweisen.</p>
        </div>
        <button type="button" className={cn(buttonVariants())} onClick={() => setOpen(true)}>
          <Upload className="mr-2 h-4 w-4" />
          Vertrag hochladen
        </button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Vertrag hochladen</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="space-y-2">
              <Label>Datei</Label>
              <Input
                type="file"
                accept=".pdf,.doc,.docx"
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
              <Label>Typ</Label>
              <Select value={type} onValueChange={(v) => setType(v || "loan_agreement")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[
                    "loan_agreement",
                    "subordinated_loan",
                    "amendment",
                    "additional",
                  ].map((t) => (
                    <SelectItem key={t} value={t}>
                      {contractTypeLabels[t] || t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                fd.append("type", type);
                fd.append("file", file);
                if (investorIds.length) {
                  fd.append("assignedInvestors", JSON.stringify(investorIds));
                }
                try {
                  await createContract(fd).unwrap();
                  toast.success("Vertrag hochgeladen");
                  setOpen(false);
                  setFile(null);
                  setTitle("");
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

      {contracts.length === 0 ? (
        <EmptyState title="Keine Verträge" description="Laden Sie den ersten Vertrag hoch." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {contracts.map((c) => (
            <DocumentCard
              key={c.id}
              title={c.title}
              meta={`Unterzeichnet ${c.signedAt} · ${c.size}`}
              badge={contractTypeLabels[c.type] || c.type.replace(/_/g, " ")}
              downloadPath={`/contracts/${c.id}/download`}
              onDelete={async () => {
                await deleteContract(c.id).unwrap();
                toast.success("Vertrag gelöscht");
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
