"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, UserRole } from "@/types";
import { mockUsers } from "@/mock-data/users";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
  hasRole: (role: UserRole) => boolean;
}

const credentials: Record<string, string> = {
  "admin@buyback.com": "Admin@123",
  "investor@buyback.com": "Investor@123",
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      login: async (email, password) => {
        await new Promise((r) => setTimeout(r, 400));
        const normalized = email.trim().toLowerCase();
        if (credentials[normalized] !== password) {
          return { ok: false, error: "Invalid email or password." };
        }
        const user = mockUsers.find((u) => u.email.toLowerCase() === normalized);
        if (!user) {
          return { ok: false, error: "User not found." };
        }
        set({ user, isAuthenticated: true });
        return { ok: true };
      },
      logout: () => set({ user: null, isAuthenticated: false }),
      hasRole: (role) => get().user?.role === role,
    }),
    { name: "depth-auth" }
  )
);

export function getRedirectForRole(role: UserRole): string {
  return role === "admin" ? "/admin/dashboard" : "/dashboard";
}
