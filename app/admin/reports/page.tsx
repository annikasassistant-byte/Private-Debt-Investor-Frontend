"use client";

import { DocumentCard } from "@/components/documents/document-card";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import { useGetReportsQuery, useCreateReportMutation } from "@/services/domainApi";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { getApiErrorMessage } from "@/services/auth-mappers";
import { API_BASE_URL } from "@/services/config";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function AdminReportsPage() {
  const { data: reports = [], isLoading } = useGetReportsQuery();
  const [createReport, { isLoading: uploading }] = useCreateReportMutation();

  if (isLoading) return <LoadingSkeleton variant="page" />;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Financial Reports</h1>
          <p className="text-sm text-muted-foreground">Upload and assign reports to investors.</p>
        </div>
        <label className={cn(buttonVariants(), uploading && "pointer-events-none opacity-50")}>
          <Upload className="mr-2 h-4 w-4" />
          {uploading ? "Uploading…" : "Upload report"}
          <input
            type="file"
            className="hidden"
            accept=".pdf,.doc,.docx,.xls,.xlsx,image/*"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const fd = new FormData();
              fd.append("title", file.name);
              fd.append("category", "other");
              fd.append("file", file);
              try {
                await createReport(fd).unwrap();
                toast.success("Report uploaded");
              } catch (error) {
                toast.error(getApiErrorMessage(error, "Upload failed"));
              }
              e.target.value = "";
            }}
          />
        </label>
      </div>
      {reports.length === 0 ? (
        <EmptyState title="No reports" description="Upload the first financial report." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {reports.map((r) => (
            <DocumentCard
              key={r.id}
              title={r.title}
              meta={`${r.period || "—"} · ${r.size}`}
              badge={r.category}
              href={r.fileUrl ? `${API_BASE_URL}${r.fileUrl}` : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}
