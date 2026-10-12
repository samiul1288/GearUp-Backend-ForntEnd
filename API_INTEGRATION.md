# API Integration Reference

Complete mapping between GearUp UI components and backend API endpoints.

## 1. Conventions

- **Base URL**: `NEXT_PUBLIC_API_BASE_URL` (see `.env.local` / `.env`) — currently `https://gear-up-backend-project.vercel.app/api`.
- **HTTP client**: shared Axios instance in `src/lib/api-client.ts`. All services use it — never call `fetch` directly.
- **Authentication**: JWT stored in `localStorage` (`token`) and mirrored into two readable cookies so Next.js middleware (Edge runtime) can inspect them — `gearup_token` (the JWT) and `gearup_role` (the user's role, taken from the **login API response**, so middleware never depends on specific JWT claims). The request interceptor attaches `Authorization: Bearer <token>` to every request.
- **Response envelope**: success → `{ success: true, message?, data: T }`; error → `{ success?: false, message, errors? }`. Services unwrap `data` and throw when `success` is false.
- **List responses**: either a plain array or `{ items: T[], meta: { page, limit, total, totalPages } }` — services normalize both shapes to arrays.
- **Errors**: `getApiErrorMessage(error)` extracts the backend `message` for toasts. Any **401** clears the session and redirects to `/login?redirect=<current-url>`.
- **Roles**: `CUSTOMER | PROVIDER | ADMIN`. Registration only offers CUSTOMER/PROVIDER; ADMIN is granted by the backend via the JWT.

## 2. Auth & session

| UI component | Method | Endpoint | Payload | Response `data` |
| --- | --- | --- | --- | --- |
| `src/app/login/page.tsx` (LoginForm) | POST | `/auth/login` | `{ email, password }` | `{ user, token }` |
| `src/app/register/page.tsx` | POST | `/auth/register` | `{ name, email, password, role }` | `{ user, token }` |
| `authService.getMe()` | GET | `/auth/me` | — | `User` |

On success the client persists the session (`setAuthSession` → localStorage + cookie), updates the global `useAuth()` state, and routes by role: CUSTOMER → `/dashboard/customer`, PROVIDER → `/dashboard/provider`, ADMIN → `/dashboard/admin`.

## 3. Gear browsing (public)

| UI component | Method | Endpoint | Params | Response `data` |
| --- | --- | --- | --- | --- |
| `GearBrowser` (`src/app/gear/page.tsx`) | GET | `/gear` | `?search&category&minPrice&maxPrice` (`GearSearchParams`) | `GearItem[]` (or paginated) |
| Gear detail (`src/app/gear/[id]/page.tsx`, `GearCard`) | GET | `/gear/:id` | — | `GearItem` |

## 4. Customer dashboard (`/dashboard/customer`)

`CustomerDashboard` — `src/components/dashboard/customer-dashboard.tsx`

| Action in UI | Method | Endpoint | Payload | Response `data` |
| --- | --- | --- | --- | --- |
| Browse gear suggestions | GET | `/gear` | search params | `GearItem[]` |
| "My rentals" list | GET | `/rentals` | — | `Rental[]` |
| Book gear (create rental) | POST | `/rentals` | `{ gearId, startDate, endDate }` | `Rental` |
| "Pay now" (redirect to gateway) | POST | `/payments/create` | `{ rentalId }` | `{ gatewayUrl }` |
| Leave review (returned rentals) | POST | `/reviews` | `{ rentalId, rating, comment }` | — |

## 5. Provider dashboard (`/dashboard/provider`)

`ProviderDashboard` — `src/components/dashboard/provider-dashboard.tsx`

| Action in UI | Method | Endpoint | Payload | Response `data` |
| --- | --- | --- | --- | --- |
| My listings | GET | `/provider/gear` | — | `GearItem[]` (or paginated) |
| Add listing | POST | `/provider/gear` | `ProviderGearPayload` | `GearItem` |
| Edit listing | PUT | `/provider/gear/:id` | `ProviderGearPayload` | `GearItem` |
| Delete listing | DELETE | `/provider/gear/:id` | — | — |
| Incoming orders | GET | `/provider/orders` | — | `ProviderOrder[]` |
| Change order status | PATCH | `/provider/orders/:id` | `{ status: "PLACED" \| "CONFIRMED" \| "PICKED_UP" \| "RETURNED" }` | `ProviderOrder` |

`ProviderGearPayload`: `{ name, category, description, pricePerDay, stock, images[] }`

## 6. Admin dashboard (`/dashboard/admin`)

`AdminPanel` + tables — `src/components/admin/*`, calls via `adminService` (`src/services/admin.service.ts`)

| UI component | Action | Method | Endpoint | Payload | Response `data` |
| --- | --- | --- | --- | --- | --- |
| `UsersTable` | Load all users | GET | `/admin/users` | — | `AdminUser[]` (or paginated) |
| `UsersTable` | Suspend user | PATCH | `/admin/users/:id` | `{ status: "SUSPENDED" }` | `AdminUser` |
| `UsersTable` | Activate user | PATCH | `/admin/users/:id` | `{ status: "ACTIVE" }` | `AdminUser` |
| `GearTable` | All listings platform-wide | GET | `/admin/gear` | — | `AdminGearItem[]` (or paginated) |
| `RentalsTable` | All rental orders | GET | `/admin/rentals` | — | `AdminRentalOrder[]` (or paginated) |

`AdminUser`: `{ id, name, email, role, status: "ACTIVE" | "SUSPENDED", createdAt, ... }`

## 7. Route protection (middleware)

`src/middleware.ts` runs on `/dashboard/:path*`. It requires a non-expired `gearup_token` cookie, then resolves the role from (1) the `gearup_role` cookie written at login/hydration, (2) a JWT-decode fallback for legacy sessions, or (3) nothing — in which case it only enforces authentication and the client-side `RoleGate` finishes role enforcement (this prevents redirect loops when the backend JWT has no standard role claim). JWT decoding (`src/lib/jwt.ts`) is decode-only — **no signature verification**; the backend must still authorize every request.

| Route | Required role | Unauthenticated visitor | Wrong role |
| --- | --- | --- | --- |
| `/dashboard/admin` | ADMIN | → `/login?redirect=...` | → own role dashboard |
| `/dashboard/provider` | PROVIDER | → `/login?redirect=...` | → own role dashboard |
| `/dashboard/customer` | CUSTOMER | → `/login?redirect=...` | → own role dashboard |
| `/dashboard` | any valid role | → `/login?redirect=...` | — (→ own dashboard) |

The client-side `RoleGate` component (`src/components/auth/role-gate.tsx`) mirrors these rules as a second layer of defense after hydration.

**Error boundaries** (all layouts):

| File | Scope |
| --- | --- |
| `src/app/global-error.tsx` | Fatal errors in the root layout (renders its own `<html>`) |
| `src/app/error.tsx` | Any page below the root layout (`reset()` + back home) |
| `src/app/not-found.tsx` | 404 for unmatched routes |
| `src/app/dashboard/error.tsx` | Errors inside `/dashboard/*` |
| `src/app/dashboard/not-found.tsx` | `notFound()` / unknown routes inside `/dashboard/*` |

## 8. Adding a new integration

1. Add request/response types in `src/types/` (or `src/types/index.ts`).
2. Create `src/services/<feature>.service.ts` using `apiClient` and unwrapping the envelope — copy `admin.service.ts` as a template.
3. Call the service from a `"use client"` component; surface errors with `toast.error(getApiErrorMessage(e))` (sonner) and loading/empty/error states with `TableSkeleton`, `ErrorState`, `EmptyState` from `src/components/ui/data-state.tsx`.

## 9. Backend contract assumptions (verify against the API!)

These shapes were inferred and may need adjusting if the backend differs:

- Every endpoint returns the `{ success, message, data }` envelope.
- `PATCH /admin/users/:id` accepts `{ status: "ACTIVE" | "SUSPENDED" }` (some backends use `isActive: boolean` instead).
- Admin list endpoints (`/admin/users`, `/admin/gear`, `/admin/rentals`) return either plain arrays or `{ items, meta }`.
- The JWT carries `role` (top level or nested `user.role`) and an `exp` claim — middleware relies on both.
- `POST /payments/create` returns `{ gatewayUrl }` for the client redirect.

