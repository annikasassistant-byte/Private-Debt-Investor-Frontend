"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/auth-store";
import type { UserRole } from "@/types";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import {
  useLazyGetProfileQuery,
  useRefreshSessionMutation,
} from "@/services/authApi";
import { mapServerUserToClient } from "@/services/auth-mappers";
import { getStoredAccessToken, getStoredRefreshToken } from "@/services/config";

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user, hasRole, setUser, logout } = useAuthStore();
  const [hydrated, setHydrated] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [fetchProfile] = useLazyGetProfileQuery();
  const [refreshSession] = useRefreshSessionMutation();

  useEffect(() => {
    const finish = () => setHydrated(true);
    if (useAuthStore.persist.hasHydrated()) {
      finish();
      return;
    }
    const unsub = useAuthStore.persist.onFinishHydration(finish);
    return unsub;
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    let cancelled = false;

    (async () => {
      try {
        // Hard refresh: memory is empty; restore via sessionStorage refresh token
        // and/or httpOnly cookies before calling /users/me.
        if (!getStoredAccessToken()) {
          try {
            await refreshSession().unwrap();
          } catch {
            // Cookie-only path may still succeed on /users/me
            if (!getStoredRefreshToken()) {
              /* continue to profile — cookies may authenticate */
            }
          }
        }

        const profile = await fetchProfile().unwrap();
        if (cancelled) return;
        setUser(mapServerUserToClient(profile));
      } catch {
        if (cancelled) return;
        logout();
      } finally {
        if (!cancelled) setSessionChecked(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [hydrated, fetchProfile, refreshSession, setUser, logout]);

  useEffect(() => {
    if (!hydrated || !sessionChecked) return;
    if (!isAuthenticated || !user) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }
    if (allowedRoles && !allowedRoles.some((r) => hasRole(r))) {
      router.replace("/unauthorized");
    }
  }, [
    hydrated,
    sessionChecked,
    isAuthenticated,
    user,
    allowedRoles,
    hasRole,
    router,
    pathname,
  ]);

  if (!hydrated || !sessionChecked || !isAuthenticated || !user) {
    return <LoadingSkeleton variant="page" />;
  }

  if (allowedRoles && !allowedRoles.some((r) => hasRole(r))) {
    return <LoadingSkeleton variant="page" />;
  }

  return <>{children}</>;
}
