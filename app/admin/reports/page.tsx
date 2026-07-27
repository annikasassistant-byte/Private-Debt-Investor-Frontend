"use client";

import { mockReports } from "@/mock-data/reports";
import { DocumentCard } from "@/components/documents/document-card";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { toast } from "sonner";

export default function AdminReportsPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Financial Reports</h1>
          <p className="text-sm text-muted-foreground">Upload and assign reports to investors.</p>
        </div>
        <Button onClick={() => toast.success("Report uploaded (demo)")}>
          <Upload className="mr-2 h-4 w-4" />
          Upload report
        </Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {mockReports.map((r) => (
          <DocumentCard
            key={r.id}
            title={r.title}
            meta={`${r.period} · ${r.size}`}
            badge={r.category}
          />
        ))}
      </div>
    </div>
  );
}
