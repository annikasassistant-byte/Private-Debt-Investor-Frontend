import type { PaymentStatus } from "@/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const styles: Record<PaymentStatus | "active" | "inactive" | "matured" | "closed" | "pending", string> = {
  completed: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
  upcoming: "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/20",
  scheduled: "bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/20",
  future: "bg-muted text-muted-foreground border-border",
  overdue: "bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/20",
  partially_paid: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/20",
  cancelled: "bg-muted text-muted-foreground line-through",
  active: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
  inactive: "bg-muted text-muted-foreground",
  matured: "bg-violet-500/15 text-violet-700 dark:text-violet-400",
  closed: "bg-muted text-muted-foreground",
  pending: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
};

export function StatusBadge({
  status,
  label,
  className,
}: {
  status: keyof typeof styles;
  label?: string;
  className?: string;
}) {
  const text =
    label ??
    status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  return (
    <Badge variant="outline" className={cn("font-medium capitalize", styles[status], className)}>
      {text}
    </Badge>
  );
}
