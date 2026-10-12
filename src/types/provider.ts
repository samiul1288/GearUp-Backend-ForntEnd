import type { GearItem } from "@/types/gear";

export interface ProviderGearPayload {
  title: string;
  categoryId: string;
  description: string;
  pricePerDay: number;
  location: string;
  brand: string;
  isAvailable: boolean;
  images: string[];
  specifications: Record<string, string>;
}

export type ProviderOrderStatus =
  | "PENDING"
  | "APPROVED"
  | "ACTIVE"
  | "COMPLETED"
  | "CANCELLED"
  | "REJECTED";

export interface ProviderOrder {
  id: string;
  status: ProviderOrderStatus;
  startDate: string;
  endDate: string;
  totalPrice?: number;
  totalAmount?: number;
  customer?: {
    id?: string;
    name?: string;
    email?: string;
  };
  gear?: GearItem & { title?: string };
}
