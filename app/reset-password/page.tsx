"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Button, buttonVariants } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { AuthFlowShell } from "@/components/auth/auth-flow-shell";
import { clearPasswordResetFlow, getResetToken } from "@/lib/password-reset-flow";
import { useResetPasswordMutation } from "@/services/authApi";
import { getApiErrorMessage } from "@/services/auth-mappers";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";

const schema = z
  .object({
    password: z
      .string()
      .min(8, "At least 8 characters")
      .regex(/[A-Za-z]/, "Must include a letter")
      .regex(/[0-9]/, "Must include a number"),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: "Passwords must match",
    path: ["confirm"],
  });

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [ready, setReady] = useState(false);
  const [resetToken, setResetTokenState] = useState<string | null>(null);
  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) });

  useEffect(() => {
    const fromQuery = searchParams.get("token");
    const fromSession = getResetToken();
    const token = fromQuery || fromSession;
    if (!token) {
      router.replace("/forgot-password");
      return;
    }
    setResetTokenState(token);
    setReady(true);
  }, [router, searchParams]);

  if (!ready || !resetToken) {
    return (
      <div className="mesh-background flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-pulse rounded-xl bg-primary/20" />
      </div>
    );
  }

  return (
    <AuthFlowShell
      step={3}
      title="Create new password"
      description="Choose a strong password. You'll use it the next time you sign in."
    >
      <form
        className="space-y-5"
        onSubmit={handleSubmit(async (values) => {
          try {
            await resetPassword({
              resetToken,
              password: values.password,
            }).unwrap();
            clearPasswordResetFlow();
            toast.success("Password updated");
            router.push("/login");
          } catch (error) {
            toast.error(getApiErrorMessage(error, "Unable to reset password"));
          }
        })}
      >
        <div className="space-y-2">
          <Label
            htmlFor="password"
            className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
          >
            New password
          </Label>
          <PasswordInput id="password" className="h-11 rounded-xl" {...register("password")} />
          {errors.password && (
            <p className="text-sm text-destructive">{errors.password.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label
            htmlFor="confirm"
            className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
          >
            Confirm password
          </Label>
          <PasswordInput id="confirm" className="h-11 rounded-xl" {...register("confirm")} />
          {errors.confirm && (
            <p className="text-sm text-destructive">{errors.confirm.message}</p>
          )}
        </div>
        <Button type="submit" className="h-11 w-full rounded-xl" disabled={isLoading}>
          {isLoading ? "Updating…" : "Update password"}
        </Button>
        <Link
          href="/login"
          className={cn(buttonVariants({ variant: "ghost" }), "w-full rounded-xl")}
        >
          Back to sign in
        </Link>
      </form>
    </AuthFlowShell>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<LoadingSkeleton variant="page" />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
