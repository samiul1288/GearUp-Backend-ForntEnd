/**
 * Shared API types shared across services and components.
 * Adjust these to match your backend's actual response shapes.
 */

/** Standard envelope returned by successful API calls. */
export interface ApiSuccessResponse<T> {
  success: true;
  message?: string;
  data: T;
}

/** Standard error body returned by the API. */
export interface ApiErrorResponse {
  success?: false;
  message: string;
  errors?: Record<string, string[]>;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

/** Metadata returned with paginated lists. */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  meta: PaginationMeta;
}

/** User roles supported by the platform. */
export type Role = "CUSTOMER" | "PROVIDER" | "ADMIN";

export type RentalStatus =
  | "PENDING"
  | "APPROVED"
  | "ACTIVE"
  | "COMPLETED"
  | "CANCELLED"
  | "REJECTED";
export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";
export type PaymentGateway = "STRIPE" | "SSLCOMMERZ";

/** Account status managed by admins (suspend/activate). */
export type UserStatus = "ACTIVE" | "BLOCKED" | "SUSPENDED";

/** Payload for POST /auth/login */
export interface LoginPayload {
  email: string;
  password: string;
}

/** Payload for POST /auth/register */
export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role: Role;
}

/** The authenticated user returned by the API. */
export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  status?: UserStatus;
  phone?: string | null;
  address?: string | null;
  avatar?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

/** Response body of /auth/login and /auth/register. */
export interface AuthResponse {
  user: User;
  accessToken: string;
}

// ---------------------------------------------------------------------------
// Admin dashboard DTOs (assumed shapes — adjust to match the backend).
// ---------------------------------------------------------------------------

/** A user as returned by GET /admin/users. */
export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: UserStatus;
  createdAt: string;
}

/** A gear listing as returned by GET /admin/gear. */
export interface AdminGearItem {
  id: string;
  title: string;
  category?: string | { name?: string | null };
  pricePerDay?: number;
  isAvailable?: boolean;
  status?: string;
  owner?: { id: string; name: string };
  provider?: { id: string; name: string };
  createdAt: string;
  [key: string]: unknown;
}

/** A rental order as returned by GET /admin/rentals. */
export interface AdminRentalOrder {
  id: string;
  status: string;
  startDate?: string;
  endDate?: string;
  totalAmount?: number;
  customer?: { id: string; name: string };
  gear?: { id: string; title: string };
  createdAt: string;
  [key: string]: unknown;
}

/** Body sent with PATCH /users/status/:id. */
export interface AdminUpdateUserPayload {
  status: UserStatus;
}
