"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export type InvestorOption = { id: string; name: string };

export function InvestorMultiSelect({
  investors,
  selectedIds,
  onChange,
  className,
}: {
  investors: InvestorOption[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  className?: string;
}) {
  const toggle = (id: string, checked: boolean) => {
    if (checked) onChange(Array.from(new Set([...selectedIds, id])));
    else onChange(selectedIds.filter((x) => x !== id));
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between gap-2">
        <Label>Investoren zuweisen</Label>
        {investors.length > 0 && (
          <button
            type="button"
            className="text-xs text-primary hover:underline"
            onClick={() =>
              onChange(
                selectedIds.length === investors.length ? [] : investors.map((i) => i.id)
              )
            }
          >
            {selectedIds.length === investors.length ? "Alle abwählen" : "Alle auswählen"}
          </button>
        )}
      </div>
      <div className="max-h-40 space-y-2 overflow-y-auto rounded-lg border border-border/50 p-3">
        {investors.length === 0 ? (
          <p className="text-xs text-muted-foreground">Keine Investoren verfügbar.</p>
        ) : (
          investors.map((inv) => {
            const checked = selectedIds.includes(inv.id);
            return (
              <label
                key={inv.id}
                className="flex cursor-pointer items-center gap-2 text-sm"
              >
                <Checkbox
                  checked={checked}
                  onCheckedChange={(v) => toggle(inv.id, Boolean(v))}
                />
                <span>{inv.name}</span>
              </label>
            );
          })
        )}
      </div>
      <p className="text-[11px] text-muted-foreground">
        {selectedIds.length} ausgewählt · Mehrfachzuweisung möglich
      </p>
    </div>
  );
}
