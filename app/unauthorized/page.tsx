import Link from "next/link";
import { ShieldOff } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function UnauthorizedPage() {
  return (
    <div className="mesh-background flex min-h-screen flex-col items-center justify-center gap-8 p-6 text-center">
      <div className="glass-panel-strong relative flex h-24 w-24 items-center justify-center rounded-3xl">
        <div className="absolute inset-0 rounded-3xl bg-destructive/10 blur-xl" />
        <ShieldOff className="relative h-11 w-11 text-destructive" strokeWidth={1.5} />
      </div>
      <div className="max-w-md space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-destructive">403</p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Access denied</h1>
        <p className="text-base leading-relaxed text-muted-foreground">
          You don&apos;t have permission to view this page. Investors can only access personal
          portfolio data.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        <Link href="/dashboard" className={cn(buttonVariants(), "rounded-xl px-6")}>
          Go to dashboard
        </Link>
        <Link
          href="/login"
          className={cn(buttonVariants({ variant: "outline" }), "rounded-xl px-6")}
        >
          Sign in
        </Link>
      </div>
    </div>
  );
}
