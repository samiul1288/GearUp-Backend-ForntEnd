import { NextResponse, type NextRequest } from "next/server";
import {
  getRoleFromToken,
  isTokenExpired,
  ROLE_COOKIE_NAME,
  TOKEN_COOKIE_NAME,
} from "@/lib/jwt";
import type { Role } from "@/types";

/** Mirrors ROLE_HOME in src/lib/auth.ts (kept separate to stay Edge-safe). */
const ROLE_HOME: Record<Role, string> = {
  CUSTOMER: "/dashboard/customer",
  PROVIDER: "/dashboard/provider",
  ADMIN: "/dashboard/admin",
};

/** Route segment → required role (e.g. /dashboard/admin requires ADMIN). */
const SEGMENT_ROLE: Record<string, Role> = {
  admin: "ADMIN",
  provider: "PROVIDER",
  customer: "CUSTOMER",
};

const VALID_ROLES: Role[] = ["CUSTOMER", "PROVIDER", "ADMIN"];

/** Normalize a cookie value to a known role, or null. */
function toRole(value: string | undefined): Role | null {
  const role = String(decodeSafe(value ?? "")).toUpperCase() as Role;
  return VALID_ROLES.includes(role) ? role : null;
}

/** Cookie values are URL-encoded when written — decode defensively. */
function decodeSafe(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

/**
 * Strict role-based route protection for /dashboard/*.
 *
 * Role source (in order):
 * 1. `gearup_role` cookie — written by the client from the LOGIN RESPONSE,
 *    so it works no matter what claims the backend JWT carries.
 * 2. JWT decode fallback (legacy sessions without the role cookie).
 * 3. Still unknown → require a valid token only; the client-side RoleGate
 *    enforces the exact role after hydration. This fallback makes redirect
 *    loops impossible.
 *
 * The backend must still verify the JWT signature and authorize every
 * /admin/* and other protected endpoints server-side.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = decodeSafe(request.cookies.get(TOKEN_COOKIE_NAME)?.value ?? "");
  if (!token || isTokenExpired(token)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 1) Primary: role cookie written at login/hydration. 2) Fallback: JWT.
  const role = toRole(request.cookies.get(ROLE_COOKIE_NAME)?.value) ?? getRoleFromToken(token);

  // Token is valid but role is unknown (old session / non-standard JWT):
  // allow the request; RoleGate finishes enforcement with the stored user.
  if (!role) {
    return NextResponse.next();
  }

  // /dashboard (no segment) → send each role to its own dashboard.
  const segment = pathname.split("/")[2];
  if (!segment) {
    return NextResponse.redirect(new URL(ROLE_HOME[role], request.url));
  }

  // Wrong role for this dashboard → bounce to the user's own dashboard.
  const requiredRole = SEGMENT_ROLE[segment];
  if (requiredRole && role !== requiredRole) {
    return NextResponse.redirect(new URL(ROLE_HOME[role], request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Strict matcher: only run on dashboard routes (never on static assets).
  matcher: ["/dashboard/:path*"],
};