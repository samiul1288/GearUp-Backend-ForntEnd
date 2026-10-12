import apiClient from "@/lib/api-client";
import type { ApiResponse, PaginatedResponse } from "@/types";
import type { GearCategory, GearItem, GearSearchParams } from "@/types/gear";

type CategoryListData = GearCategory[] | PaginatedResponse<GearCategory>;

export type GearApiRecord = Omit<GearItem, "name" | "available"> & {
  name?: string;
  title?: string;
  isAvailable?: boolean;
  available?: boolean;
};

export function normalizeGearItem(item: GearApiRecord): GearItem {
  const name = item.title ?? item.name;
  if (!name) throw new Error("The gears API returned an item without a title.");
  return {
    ...item,
    name,
    available: item.available ?? item.isAvailable,
  };
}

export const gearService = {
  async getGear(params: GearSearchParams, signal?: AbortSignal): Promise<GearItem[]> {
    const { data } = await apiClient.get<
      ApiResponse<GearApiRecord[] | PaginatedResponse<GearApiRecord>>
    >("/api/gears", {
      params,
      signal,
    });
    if (!data.success) throw new Error(data.message);
    return (Array.isArray(data.data) ? data.data : data.data.items).map(normalizeGearItem);
  },

  async getGearById(id: string, signal?: AbortSignal): Promise<GearItem> {
    const { data } = await apiClient.get<ApiResponse<GearApiRecord>>(
      `/api/gears/${encodeURIComponent(id)}`,
      { signal }
    );
    if (!data.success) throw new Error(data.message);
    return normalizeGearItem(data.data);
  },

  async getCategories(signal?: AbortSignal): Promise<GearCategory[]> {
    const { data } = await apiClient.get<ApiResponse<CategoryListData>>("/api/categories", {
      signal,
    });
    if (!data.success) throw new Error(data.message);
    return Array.isArray(data.data) ? data.data : data.data.items;
  },
};
