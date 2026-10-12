import apiClient from "@/lib/api-client";
import type { ApiResponse, PaginatedResponse } from "@/types";
import type { GearItem } from "@/types/gear";
import { normalizeGearItem, type GearApiRecord } from "@/services/gear.service";
import type {
  ProviderGearPayload,
  ProviderOrder,
  ProviderOrderStatus,
} from "@/types/provider";

type OrderListData = ProviderOrder[] | PaginatedResponse<ProviderOrder>;

export const providerService = {
  async getGear(signal?: AbortSignal): Promise<GearItem[]> {
    const { data } = await apiClient.get<
      ApiResponse<GearApiRecord[] | PaginatedResponse<GearApiRecord>>
    >("/api/gears", { signal });
    if (!data.success) throw new Error(data.message);
    return (Array.isArray(data.data) ? data.data : data.data.items).map(normalizeGearItem);
  },

  async createGear(payload: ProviderGearPayload): Promise<GearItem> {
    const { data } = await apiClient.post<ApiResponse<GearApiRecord>>("/api/gears", payload);
    if (!data.success) throw new Error(data.message);
    return normalizeGearItem(data.data);
  },

  async updateGear(id: string, payload: ProviderGearPayload): Promise<GearItem> {
    const { data } = await apiClient.patch<ApiResponse<GearApiRecord>>(
      `/api/gears/${encodeURIComponent(id)}`,
      payload
    );
    if (!data.success) throw new Error(data.message);
    return normalizeGearItem(data.data);
  },

  async deleteGear(id: string): Promise<void> {
    const { data } = await apiClient.delete<ApiResponse<unknown>>(
      `/api/gears/${encodeURIComponent(id)}`
    );
    if (!data.success) throw new Error(data.message);
  },

  async getOrders(signal?: AbortSignal): Promise<ProviderOrder[]> {
    const { data } = await apiClient.get<ApiResponse<OrderListData>>("/api/rentals", { signal });
    if (!data.success) throw new Error(data.message);
    return Array.isArray(data.data) ? data.data : data.data.items;
  },

  async updateOrderStatus(id: string, status: ProviderOrderStatus): Promise<ProviderOrder> {
    const { data } = await apiClient.patch<ApiResponse<ProviderOrder>>(
      `/api/rentals/${encodeURIComponent(id)}/status`,
      { status }
    );
    if (!data.success) throw new Error(data.message);
    return data.data;
  },
};
