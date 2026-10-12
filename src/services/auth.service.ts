import apiClient from "@/lib/api-client";
import { normalizeRole } from "@/lib/auth";
import type { ApiResponse, AuthResponse, LoginPayload, RegisterPayload, User } from "@/types";

/** Ensure the user returned by the backend always carries a valid Role. */
function withNormalizedRole(auth: AuthResponse): AuthResponse {
  const { password: _password, ...user } = auth.user as User & {
    password?: unknown;
  };
  return { ...auth, user: { ...user, role: normalizeRole(auth.user?.role) } };
}

/**
 * Auth service — shows how services should use the shared api-client.
 * The JWT is attached automatically; callers never handle tokens for requests.
 */
export const authService = {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const { data } = await apiClient.post<ApiResponse<AuthResponse>>("/api/auth/login", payload, {
      withCredentials: true,
    });
    if (!data.success) throw new Error(data.message);
    return withNormalizedRole(data.data);
  },

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const { data } = await apiClient.post<ApiResponse<AuthResponse>>(
      "/api/auth/register",
      payload,
      { withCredentials: true }
    );
    if (!data.success) throw new Error(data.message);
    return withNormalizedRole(data.data);
  },

  /** Example of an authenticated GET — Bearer token attached automatically. */
  async getMe(): Promise<User> {
    const { data } = await apiClient.get<ApiResponse<User>>("/api/auth/me", {
      withCredentials: true,
    });
    if (!data.success) throw new Error(data.message);
    const { password: _password, ...user } = data.data as User & {
      password?: unknown;
    };
    return { ...user, role: normalizeRole(data.data?.role) };
  },
};
