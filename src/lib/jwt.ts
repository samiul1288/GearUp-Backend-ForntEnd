import type { Role } from "@/types";

/**
 * Cookie names shared with the client auth helpers.
 * Kept here (not in api-client) so middleware can import them without
 * pulling Axios into the Edge bundle.
 */
export const TOKEN_COOKIE_NAME = "gearup_token";
export const ROLE_COOKIE_NAME = "gearup_role";

/** JWT claims we care about. */
export interface JwtPayload {
  role?: unknown;
  exp?: number;
  [key: string]: unknown;
}

const VALID_ROLES: Role[] = ["CUSTOMER", "PROVIDER", "ADMIN"];

/**
 * Decode a JWT payload (base64url) without verifying the signature.
 * Signature verification belongs to the backend; here we only need the
 * claims for routing decisions. Uses `atob` so it is Edge-runtime safe
 * (required for Next.js middleware).
 */
export function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const part = token.split(".")[1];
    if (!part) return null;
    const b64 = part.replace(/-/g, "+").replace(/_/g, "/");
    const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
    const json =
      typeof atob === "function"
        ? atob(padded)
        : Buffer.from(padded, "base64").toString("utf-8");
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

/**
 * Best-effort expiry check for a JWT.
 * Returns false when the token can't be parsed (opaque tokens) or has no
 * `exp` claim — the backend remains the authority on token validity.
 */
export function isTokenExpired(token: string): boolean {
  const payload = decodeJwtPayload(token);
  if (!payload || typeof payload.exp !== "number") return false;
  return payload.exp * 1000 <= Date.now();
}

/**
 * Extract a valid, non-expired role from a JWT (legacy fallback — the
 * primary role source for middleware is the `gearup_role` cookie).
 * Returns null when the token is malformed, expired, or has no known role.
 * Supports `role` at the top level or nested under `user.role`.
 */
export function getRoleFromToken(token: string): Role | null {
  const payload = decodeJwtPayload(token);
  if (!payload) return null;

  if (typeof payload.exp === "number" && payload.exp * 1000 <= Date.now()) {
    return null; // token expired
  }

  const nested = (payload.user as { role?: unknown } | undefined)?.role;
  const raw = String(payload.role ?? nested ?? "").toUpperCase() as Role;
  return VALID_ROLES.includes(raw) ? raw : null;
}