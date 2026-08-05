"use client";

import { useEffect, useRef } from "react";
import { io, type Socket } from "socket.io-client";
import { toast } from "sonner";
import { API_BASE_URL, getStoredAccessToken } from "@/services/config";
import { useAuthStore } from "@/lib/auth-store";
import { domainApi } from "@/services/domainApi";
import { useAppDispatch } from "@/store/hooks";

const PAYMENT_EVT = "server:payment_updated";
const TIMELINE_EVT = "server:timeline_updated";
const DASHBOARD_EVT = "server:dashboard_updated";

/**
 * Connects to Socket.IO when authenticated; invalidates RTK caches on portfolio events.
 */
export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const dispatch = useAppDispatch();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      return;
    }

    const token = getStoredAccessToken();
    // Prefer Bearer when available; otherwise rely on httpOnly cookie (withCredentials).
    const socket = io(API_BASE_URL, {
      path: "/socket.io",
      auth: token ? { token } : {},
      transports: ["websocket", "polling"],
      withCredentials: true,
    });
    socketRef.current = socket;

    const invalidate = () => {
      dispatch(
        domainApi.util.invalidateTags([
          "Payments",
          "Investments",
          "Dashboard",
          "Timeline",
          "Loans",
          "Investors",
        ])
      );
    };

    socket.on(PAYMENT_EVT, () => {
      invalidate();
      toast.message("Zahlungsaktualisierung empfangen");
    });
    socket.on(TIMELINE_EVT, invalidate);
    socket.on(DASHBOARD_EVT, invalidate);
    socket.on("connect_error", () => {
      // Silent — realtime is best-effort
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [isAuthenticated, dispatch]);

  return <>{children}</>;
}
