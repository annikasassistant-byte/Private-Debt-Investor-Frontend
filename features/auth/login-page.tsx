"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { ArrowRight, Copy, Layers, Shield, Sparkles, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { getRedirectForRole, useAuthStore } from "@/lib/auth-store";
import { DEMO_ADMIN, DEMO_INVESTOR } from "@/constants/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password is required"),
});

type FormValues = z.infer<typeof schema>;

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="group relative space-y-1.5">
      <Label
        htmlFor={id}
        className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground transition-colors group-focus-within:text-primary"
      >
        {label}
      </Label>
      {children}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-destructive"
          role="alert"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}

export function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useAuthStore((s) => s.login);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    const result = await login(values.email, values.password);
    setLoading(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    const user = useAuthStore.getState().user;
    const redirect = searchParams.get("redirect");
    if (redirect && redirect.startsWith("/")) {
      router.push(redirect);
    } else if (user) {
      router.push(getRedirectForRole(user.role));
    }
    toast.success("Welcome back");
  };

  const fillDemo = (type: "admin" | "investor") => {
    const creds = type === "admin" ? DEMO_ADMIN : DEMO_INVESTOR;
    setValue("email", creds.email);
    setValue("password", creds.password);
  };

  const copyCreds = (type: "admin" | "investor") => {
    const creds = type === "admin" ? DEMO_ADMIN : DEMO_INVESTOR;
    void navigator.clipboard.writeText(`${creds.email} / ${creds.password}`);
    toast.success("Credentials copied");
  };

  if (!mounted) {
    return (
      <div className="mesh-background flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-pulse rounded-xl bg-primary/20" />
      </div>
    );
  }

  return (
    <div className="mesh-background relative flex min-h-screen flex-col lg:flex-row">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 top-0 h-[28rem] w-[28rem] rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[24rem] w-[24rem] rounded-full bg-chart-2/15 blur-3xl" />
      </div>

      <motion.section
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="relative hidden flex-1 flex-col justify-between border-r border-border/40 p-12 lg:flex xl:p-16"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/25">
            <Layers className="h-5 w-5" />
          </div>
          <span className="text-lg font-semibold tracking-tight">Depth Capital</span>
        </div>
        <div className="max-w-md space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            Private debt investor portal
          </div>
          <h1 className="text-4xl font-semibold leading-[1.1] tracking-tight text-gradient-primary xl:text-5xl">
            Clarity for every capital commitment.
          </h1>
          <p className="text-lg leading-relaxed text-muted-foreground">
            Monitor performance, repayments, and documents in a secure environment built for
            institutional investors.
          </p>
        </div>
        <p className="text-sm text-muted-foreground">© 2026 Depth Capital</p>
      </motion.section>

      <div className="relative flex flex-1 items-center justify-center p-4 py-12 sm:p-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.1 }}
          className="grid w-full max-w-lg gap-6"
        >
          <div className="mb-2 flex items-center gap-2 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Layers className="h-5 w-5" />
            </div>
            <span className="font-semibold">Depth Capital</span>
          </div>

          <div className="glass-panel-strong rounded-2xl p-6 sm:p-8">
            <div className="mb-8 space-y-2">
              <h2 className="text-2xl font-semibold tracking-tight">Sign in</h2>
              <p className="text-sm text-muted-foreground">
                Access your investor or administrator workspace.
              </p>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <Field id="email" label="Email" error={errors.email?.message}>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  className="h-11 rounded-xl border-border/60 bg-background/60"
                  {...register("email")}
                />
              </Field>
              <Field id="password" label="Password" error={errors.password?.message}>
                <div className="space-y-2">
                  <PasswordInput
                    id="password"
                    autoComplete="current-password"
                    className="h-11 rounded-xl border-border/60 bg-background/60"
                    {...register("password")}
                  />
                  <div className="flex justify-end">
                    <Link
                      href="/forgot-password"
                      className="text-xs font-medium text-primary hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                </div>
              </Field>
              <Button
                type="submit"
                className="h-11 w-full rounded-xl text-base font-medium shadow-lg shadow-primary/20"
                disabled={loading}
              >
                {loading ? "Signing in…" : "Continue"}
                {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
            </form>
          </div>

          <div className="glass-panel rounded-2xl p-5 sm:p-6">
            <p className="text-sm font-semibold">Demo access</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Auto-fill credentials for the preview environment.
            </p>
            <div className="mt-4 space-y-3">
              {(
                [
                  { type: "admin" as const, icon: Shield, label: "Administrator" },
                  { type: "investor" as const, icon: UserCircle, label: "Investor" },
                ] as const
              ).map(({ type, icon: Icon, label }) => {
                const creds = type === "admin" ? DEMO_ADMIN : DEMO_INVESTOR;
                return (
                  <div
                    key={type}
                    className={cn(
                      "rounded-xl border border-border/50 bg-muted/20 p-4 transition-colors hover:bg-muted/35"
                    )}
                  >
                    <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                      <Icon className="h-4 w-4 text-primary" />
                      {label}
                    </div>
                    <p className="text-xs text-muted-foreground">{creds.email}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button size="sm" className="rounded-lg" onClick={() => fillDemo(type)}>
                        Login as {label}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-lg"
                        onClick={() => copyCreds(type)}
                      >
                        <Copy className="mr-1 h-3.5 w-3.5" />
                        Copy
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
