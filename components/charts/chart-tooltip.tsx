"use client";

export function ChartTooltipContent({
  active,
  payload,
  label,
  valuePrefix = "",
}: {
  active?: boolean;
  payload?: { name?: string; value?: number; color?: string }[];
  label?: string;
  valuePrefix?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border/60 bg-popover/95 px-3 py-2.5 shadow-lg backdrop-blur-md">
      {label && (
        <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
      )}
      <ul className="space-y-1">
        {payload.map((entry, i) => (
          <li key={i} className="flex items-center justify-between gap-6 text-sm">
            <span className="flex items-center gap-2 text-muted-foreground">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              {entry.name}
            </span>
            <span className="tabular-financial font-semibold text-foreground">
              {valuePrefix}
              {Number(entry.value ?? 0).toLocaleString()}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
