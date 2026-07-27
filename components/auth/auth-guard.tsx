"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/auth-store";
import type { UserRole } from "@/types";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user, hasRole } = useAuthStore();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthenticated || !user) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }
    if (allowedRoles && !allowedRoles.some((r) => hasRole(r))) {
      router.replace("/unauthorized");
    }
  }, [hydrated, isAuthenticated, user, allowedRoles, hasRole, router, pathname]);

  if (!hydrated || !isAuthenticated || !user) {
    return <LoadingSkeleton variant="page" />;
  }

  if (allowedRoles && !allowedRoles.some((r) => hasRole(r))) {
    return <LoadingSkeleton variant="page" />;
  }

  return <>{children}</>;
}
