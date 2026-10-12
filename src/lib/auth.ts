import { clearAuthToken, clearRoleCookie, getAuthToken, setAuthToken, setRoleCookie } from "@/lib/api-client";
import type { AuthResponse, Role, User } from "@/types";

/** localStorage key used to persist the authenticated user object. */
export const USER_STORAGE_KEY = "user";

/** Landing route for each role after login/register. */
export const ROLE_HOME: Record<Role, string> = {
  CUSTOMER: "/dashboard/customer",
  PROVIDER: "/dashboard/provider",
  ADMIN: "/dashboard/admin",
};

/** Human-readable labels for each role. */
export const ROLE_META: Record<Role, { label: string }> = {
  CUSTOMER: { label: "Customer" },
  PROVIDER: { label: "Provider" },
  ADMIN: { label: "Admin" },
};

const VALID_ROLES: Role[] = ["CUSTOMER", "PROVIDER", "ADMIN"];

/**
 * Coerce an unknown value into a valid Role.
 * Defaults to CUSTOMER unless the value explicitly names a known role.
 */
export function normalizeRole(value: unknown): Role {
  const role = String(value ?? "").toUpperCase() as Role;
  return VALID_ROLES.includes(role) ? role : "CUSTOMER";
}

/** Get the post-login landing route for a role. */
export function getHomeForRole(role: Role): string {
  return ROLE_HOME[role] ?? "/";
}

/** Read the persisted user object (safe during SSR — returns null). */
export function getStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(USER_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as User;
    // Ensure the stored role is always a valid Role value.
    return { ...parsed, role: normalizeRole(parsed?.role) };
  } catch {
    return null;
  }
}

/** Persist both the JWT and the user object after a successful auth call. */
export function setAuthSession(auth: AuthResponse): void {
  const role = normalizeRole(auth.user?.role);
  setAuthToken(auth.accessToken);
  // Mirror the role for middleware (primary role source for route guards).
  setRoleCookie(role);
  if (typeof window === "undefined") return;
  try {
    const { password: _password, ...user } = auth.user as User & { password?: unknown };
    window.localStorage.setItem(
      USER_STORAGE_KEY,
      JSON.stringify({ ...user, role })
    );
  } catch {
    // no-op if storage is unavailable
  }
}

/** Clear both the JWT and the user object (logout / session expired). */
export function clearAuthSession(): void {
  clearAuthToken();
  clearRoleCookie();
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(USER_STORAGE_KEY);
  } catch {
    // no-op if storage is unavailable
  }
}

/** True when both a token and a user object are present. */
export function hasValidSession(): boolean {
  return Boolean(getAuthToken() && getStoredUser());
}

/**
 * Sanitize an untrusted redirect target so we only ever navigate to a
 * same-origin path (prevents open-redirect via the ?redirect= param).
 */
export function safeInternalPath(path: string | null | undefined): string | null {
  if (!path) return null;
  if (!path.startsWith("/") || path.startsWith("//")) return null;
  return path;
}