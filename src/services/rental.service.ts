import apiClient from "@/lib/api-client";
import type { ApiResponse, PaginatedResponse } from "@/types";
import type {
  CreateRentalPayload,
  CreateReviewPayload,
  GearReview,
  PaymentSession,
  Rental,
} from "@/types/rental";

type RentalListData = Rental[] | PaginatedResponse<Rental>;
type ReviewListData = GearReview[] | PaginatedResponse<GearReview>;

function listFrom<T>(data: T[] | PaginatedResponse<T>): T[] {
  return Array.isArray(data) ? data : data.items;
}

export const rentalService = {
  async getRentals(signal?: AbortSignal): Promise<Rental[]> {
    const { data } = await apiClient.get<ApiResponse<RentalListData>>("/api/rentals", { signal });
    if (!data.success) throw new Error(data.message);
    return listFrom(data.data);
  },

  async createRental(payload: CreateRentalPayload): Promise<Rental> {
    const { data } = await apiClient.post<ApiResponse<Rental>>("/api/rentals", payload);
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async createPayment(rentalId: string): Promise<{ gatewayUrl: string }> {
    const { data } = await apiClient.post<ApiResponse<PaymentSession>>("/api/payments", {
      rentalId,
      gateway: "SSLCOMMERZ",
    });
    if (!data.success) throw new Error(data.message);
    const gatewayUrl = data.data.gatewayUrl ??
      data.data.paymentData?.GatewayPageURL ??
      data.data.paymentData?.gatewayUrl;
    if (!gatewayUrl) {
      throw new Error("The payment service did not return a gateway URL.");
    }
    return { gatewayUrl };
  },

  async createReview(payload: CreateReviewPayload): Promise<void> {
    const { data } = await apiClient.post<ApiResponse<unknown>>("/api/reviews", payload);
    if (!data.success) throw new Error(data.message);
  },

  async getGearReviews(gearId: string, signal?: AbortSignal): Promise<GearReview[]> {
    const { data } = await apiClient.get<ApiResponse<ReviewListData>>(
      `/api/reviews/gear/${encodeURIComponent(gearId)}`,
      { signal }
    );
    if (!data.success) throw new Error(data.message);
    return listFrom(data.data);
  },
};
