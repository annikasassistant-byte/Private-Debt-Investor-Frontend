"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, UserRole } from "@/types";
import { clearTokens } from "@/services/config";
import { getRedirectForRole, mapServerUserToClient } from "@/services/auth-mappers";
import type { ServerUser } from "@/services/types";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setSession: (input: {
    user: ServerUser | User;
    accessToken?: string | null;
    refreshToken?: string | null;
  }) => void;
  setUser: (user: User | null) => void;
  logout: () => void;
  hasRole: (role: UserRole) => boolean;
}

function toClientUser(user: ServerUser | User): User {
  if ("name" in user && (user.role === "admin" || user.role === "investor")) {
    return user as User;
  }
  return mapServerUserToClient(user as ServerUser);
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      setSession: ({ user }) => {
        // Tokens live in httpOnly cookies only — never persist JWTs in the store/storage.
        set({ user: toClientUser(user), isAuthenticated: true });
      },
      setUser: (user) => set({ user, isAuthenticated: Boolean(user) }),
      logout: () => {
        clearTokens();
        set({ user: null, isAuthenticated: false });
      },
      hasRole: (role) => get().user?.role === role,
    }),
    { name: "depth-auth" }
  )
);

export { getRedirectForRole };
