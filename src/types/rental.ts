import type { GearItem } from "@/types/gear";
import type { PaymentGateway, PaymentStatus, RentalStatus } from "@/types";

export interface Rental {
  id: string;
  gearId?: string;
  gear?: GearItem & { title?: string };
  status: RentalStatus;
  startDate: string;
  endDate: string;
  totalPrice?: number;
  totalAmount?: number;
  price?: number;
  review?: {
    id?: string;
    rating: number;
    comment?: string;
  } | null;
}

export interface CreateRentalPayload {
  gearId: string;
  startDate: string;
  endDate: string;
}

export interface CreateReviewPayload {
  gearId: string;
  rentalId: string;
  rating: number;
  comment: string;
}

export interface PaymentSession {
  gatewayUrl?: string;
  paymentData?: {
    GatewayPageURL?: string;
    gatewayUrl?: string;
  };
  id?: string;
  rentalId?: string;
  amount?: number;
  gateway?: PaymentGateway;
  status?: PaymentStatus;
  transactionId?: string;
}

export interface GearReview {
  id: string;
  rating: number;
  comment: string;
  gearId: string;
  userId: string;
  rentalId: string;
  user?: { id: string; name: string };
  createdAt: string;
}
