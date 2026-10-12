"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { AuthResponse, Role, User } from "@/types";
import { getAuthToken, setRoleCookie, setTokenCookie } from "@/lib/api-client";
import {
  clearAuthSession,
  getStoredUser,
  hasValidSession,
  normalizeRole,
  setAuthSession,
} from "@/lib/auth";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface AuthContextValue {
  user: User | null;
  role: Role | null;
  status: AuthStatus;
  isAuthenticated: boolean;
  /** Persist the session (token + user) and update app state. */
  login: (auth: AuthResponse) => void;
  /** Clear the session and update app state (caller decides where to navigate). */
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * Client-side auth state. Hydrates from localStorage on mount so the Navbar
 * and Footer can render auth-aware UI without causing SSR/client mismatches.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");

  useEffect(() => {
    if (hasValidSession()) {
      const stored = getStoredUser();
      if (stored) {
        // Re-sync the middleware cookies (covers sessions created before the
        // cookies existed, or cookies that expired while localStorage didn't).
        const token = getAuthToken();
        if (token) setTokenCookie(token);
        setRoleCookie(stored.role);
        setUser(stored);
        setStatus("authenticated");
        return;
      }
    }
    // No (or incomplete) session — clean up any stray token.
    clearAuthSession();
    setUser(null);
    setStatus("unauthenticated");
  }, []);

  const login = useCallback((auth: AuthResponse) => {
    const normalized: User = { ...auth.user, role: normalizeRole(auth.user?.role) };
    setAuthSession({ ...auth, user: normalized });
    setUser(normalized);
    setStatus("authenticated");
  }, []);

  const logout = useCallback(() => {
    clearAuthSession();
    setUser(null);
    setStatus("unauthenticated");
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      role: user ? normalizeRole(user.role) : null,
      status,
      isAuthenticated: status === "authenticated",
      login,
      logout,
    }),
    [user, status, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/** Access auth state. Must be used within an <AuthProvider>. */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an <AuthProvider>");
  return ctx;
}