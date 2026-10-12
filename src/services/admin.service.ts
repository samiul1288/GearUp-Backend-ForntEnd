import apiClient from "@/lib/api-client";
import type {
  AdminGearItem,
  AdminRentalOrder,
  AdminUpdateUserPayload,
  AdminUser,
  ApiResponse,
  PaginatedResponse,
} from "@/types";

/** Lists may come back as a plain array or wrapped in pagination metadata. */
type ListData<T> = T[] | PaginatedResponse<T>;

function toItems<T>(data: ListData<T> | undefined | null): T[] {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.items)) return data.items;
  return [];
}

/**
 * Admin service — every call uses the API's shared resource routes.
 * The Bearer token is attached automatically by the shared api-client;
 * the backend must still verify the ADMIN role server-side.
 */
export const adminService = {
  /** GET /users — list all users for the admin table. */
  async getUsers(signal?: AbortSignal): Promise<AdminUser[]> {
    const { data } = await apiClient.get<ApiResponse<ListData<AdminUser>>>("/api/users", {
      signal,
    });
    if (!data.success) throw new Error(data.message);
    return toItems(data.data).map((user) => {
      const { password: _password, ...publicUser } = user as AdminUser & {
        password?: unknown;
      };
      return publicUser;
    });
  },

  /** PATCH /users/status/:id — suspend, block, or activate a user. */
  async updateUserStatus(id: string, status: AdminUpdateUserPayload["status"]): Promise<AdminUser> {
    const { data } = await apiClient.patch<ApiResponse<AdminUser>>(
      `/api/users/status/${encodeURIComponent(id)}`,
      { status }
    );
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  /** GET /gears — gear listings for the admin table. */
  async getGear(signal?: AbortSignal): Promise<AdminGearItem[]> {
    const { data } = await apiClient.get<ApiResponse<ListData<AdminGearItem>>>("/api/gears", {
      signal,
    });
    if (!data.success) throw new Error(data.message);
    return toItems(data.data);
  },

  /** GET /rentals — rental orders visible to the admin. */
  async getRentals(signal?: AbortSignal): Promise<AdminRentalOrder[]> {
    const { data } = await apiClient.get<ApiResponse<ListData<AdminRentalOrder>>>("/api/rentals", {
      signal,
    });
    if (!data.success) throw new Error(data.message);
    return toItems(data.data);
  },
};