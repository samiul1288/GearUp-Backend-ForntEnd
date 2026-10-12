import axios, { AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from "axios";
import { ROLE_COOKIE_NAME, TOKEN_COOKIE_NAME } from "@/lib/jwt";

export { ROLE_COOKIE_NAME, TOKEN_COOKIE_NAME };

/**
 * Key used to persist the JWT access token in localStorage.
 * Adjust this if your backend uses a different key name.
 */
export const AUTH_TOKEN_KEY = "token";

/** Route the user is sent to when their session is no longer valid. */
export const LOGIN_ROUTE = "/login";

/** Cookie lifetime for the mirrored auth cookies (seconds). */
const TOKEN_COOKIE_MAX_AGE = 7 * 24 * 60 * 60;

/** Mirror the JWT into a readable cookie (client only). */
export function setTokenCookie(token: string): void {
  if (typeof window === "undefined") return;
  document.cookie = `${TOKEN_COOKIE_NAME}=${encodeURIComponent(
    token
  )}; path=/; max-age=${TOKEN_COOKIE_MAX_AGE}; SameSite=Lax`;
}

/**
 * Mirror the user's role into a readable cookie (client only).
 * This is the PRIMARY role source for middleware — it comes from the login
 * API response, so it works regardless of what claims the JWT carries.
 */
export function setRoleCookie(role: string): void {
  if (typeof window === "undefined") return;
  document.cookie = `${ROLE_COOKIE_NAME}=${encodeURIComponent(
    role
  )}; path=/; max-age=${TOKEN_COOKIE_MAX_AGE}; SameSite=Lax`;
}

/** Remove the mirrored token cookie (client only). */
export function clearTokenCookie(): void {
  if (typeof window === "undefined") return;
  document.cookie = `${TOKEN_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
}

/** Remove the mirrored role cookie (client only). */
export function clearRoleCookie(): void {
  if (typeof window === "undefined") return;
  document.cookie = `${ROLE_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
}

/** Read the JWT from localStorage (safe to call during SSR — returns null). */
export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(AUTH_TOKEN_KEY);
  } catch {
    // localStorage can throw in private browsing / disabled storage
    return null;
  }
}

/** Persist the JWT after a successful login (storage + middleware cookie). */
export function setAuthToken(token: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(AUTH_TOKEN_KEY, token);
  } catch {
    // no-op if storage is unavailable
  }
  setTokenCookie(token);
}

/** Remove the JWT (logout / session expired). */
export function clearAuthToken(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(AUTH_TOKEN_KEY);
  } catch {
    // no-op if storage is unavailable
  }
  clearTokenCookie();
}

/**
 * Pre-configured Axios instance for the whole app.
 * - Base URL comes from NEXT_PUBLIC_API_BASE_URL
 * - Request interceptor attaches `Authorization: Bearer <token>` from localStorage
 * - Response interceptor clears the token and redirects to /login on any 401
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: "https://gear-up-backend-project.vercel.app",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 15_000,
});

// ---------- Request interceptor: attach JWT ----------
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAuthToken();
    if (token) {
      // Axios 1.x exposes typed header helpers on AxiosHeaders
      config.headers.set("Authorization", `Bearer ${token}`);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ---------- Response interceptor: global 401 handling ----------
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (typeof window !== "undefined" && error.response?.status === 401) {
      clearAuthToken();

      const { pathname, search, origin } = window.location;
      const isAlreadyOnLogin = pathname === LOGIN_ROUTE || pathname.startsWith(`${LOGIN_ROUTE}/`);

      // Only redirect when not already on the login page, to avoid redirect loops
      if (!isAlreadyOnLogin) {
        const redirectParam = encodeURIComponent(`${pathname}${search}`);
        window.location.href = `${origin}${LOGIN_ROUTE}?redirect=${redirectParam}`;
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Extract a user-facing error message from an unknown thrown value.
 * Assumes the backend returns `{ message: string }` on errors; falls back
 * to the Axios/network message.
 */
export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined;
    if (data?.message) return data.message;
    return error.message;
  }
  if (error instanceof Error) return error.message;
  return "Something went wrong. Please try again.";
}

export default apiClient;
