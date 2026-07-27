"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button, buttonVariants } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { AuthFlowShell } from "@/components/auth/auth-flow-shell";
import { setResetEmail } from "@/lib/password-reset-flow";

const schema = z.object({ email: z.string().email("Enter a valid email") });

export default function ForgotPasswordPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
  });

  return (
    <AuthFlowShell
      step={1}
      title="Forgot your password?"
      description="Enter the email associated with your account. We'll send a one-time code to verify it's you."
    >
      <form
        className="space-y-5"
        onSubmit={handleSubmit((values) => {
          setResetEmail(values.email.trim());
          toast.success("Verification code sent (demo)");
          router.push("/verify-otp");
        })}
      >
        <div className="space-y-2">
          <Label
            htmlFor="email"
            className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
          >
            Email
          </Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            className="h-11 rounded-xl"
            {...register("email")}
          />
          {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
        </div>
        <Button type="submit" className="h-11 w-full rounded-xl">
          Continue
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
