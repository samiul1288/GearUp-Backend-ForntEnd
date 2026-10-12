"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { CalendarDays, CheckCircle2, Clock3, CreditCard, Loader2, MessageSquarePlus, Plus, Star } from "lucide-react";
import { getApiErrorMessage } from "@/lib/api-client";
import { gearService } from "@/services/gear.service";
import { rentalService } from "@/services/rental.service";
import type { GearItem } from "@/types/gear";
import type { CreateRentalPayload, Rental } from "@/types/rental";
import { useAuth } from "@/components/providers/auth-provider";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

const today = new Date().toISOString().slice(0, 10);
const normalizedStatus = (status: string) => status.toLowerCase().replace(/[\s_-]/g, "");
const isConfirmed = (rental: Rental) => normalizedStatus(rental.status) === "approved";
const isCompleted = (rental: Rental) => normalizedStatus(rental.status) === "completed";
const rentalTotal = (rental: Rental) =>
  rental.totalAmount ?? rental.totalPrice ?? rental.price;

function RentalCreateModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (payload: CreateRentalPayload) => Promise<void>;
}) {
  const [gear, setGear] = useState<GearItem[]>([]);
  const [gearLoading, setGearLoading] = useState(true);
  const [gearError, setGearError] = useState("");
  const [gearId, setGearId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    gearService
      .getGear({}, controller.signal)
      .then((items) => {
        setGear(items);
        setGearId(items[0]?.id ?? "");
      })
      .catch((requestError: unknown) => {
        if (!controller.signal.aborted) setGearError(getApiErrorMessage(requestError));
      })
      .finally(() => {
        if (!controller.signal.aborted) setGearLoading(false);
      });
    return () => controller.abort();
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!gearId || !startDate || !endDate) {
      setError("Choose gear and both rental dates.");
      return;
    }
    if (endDate < startDate) {
      setError("The end date must be on or after the start date.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      await onCreated({ gearId, startDate, endDate });
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/60 p-0 sm:items-center sm:p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-rental-title"
        className="w-full max-w-lg rounded-t-2xl bg-background p-6 shadow-2xl sm:rounded-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Start a new rental</p>
            <h2 id="create-rental-title" className="mt-1 text-xl font-bold">Choose gear and dates</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close rental form"
            className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted"
          >
            Close
          </button>
        </div>
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <label className="block text-sm font-medium">
            Gear
            <select
              required
              value={gearId}
              onChange={(event) => setGearId(event.target.value)}
              disabled={gearLoading || Boolean(gearError) || gear.length === 0}
              className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2"
            >
              {gearLoading ? (
                <option value="">Loading gear...</option>
              ) : gearError ? (
                <option value="">Gear could not be loaded</option>
              ) : gear.length === 0 ? (
                <option value="">No gear is currently listed</option>
              ) : (
                gear.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} · {currency.format(item.pricePerDay)}/day
                  </option>
                ))
              )}
            </select>
          </label>
          {gearError && <p className="text-sm text-red-600" role="alert">{gearError}</p>}
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium">
              Start date
              <input
                type="date"
                required
                min={today}
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2"
              />
            </label>
            <label className="text-sm font-medium">
              End date
              <input
                type="date"
                required
                min={startDate || today}
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
                className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2"
              />
            </label>
          </div>
          {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
          <button
            type="submit"
            disabled={submitting || gearLoading || !gear.length}
            className="w-full rounded-md bg-primary px-4 py-3 font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "Creating rental..." : "Request rental"}
          </button>
        </form>
      </section>
    </div>
  );
}

function ReviewForm({
  rental,
  onSubmit,
  onCancel,
}: {
  rental: Rental;
  onSubmit: (rating: number, comment: string) => Promise<void>;
  onCancel: () => void;
}) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await onSubmit(rating, comment.trim());
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="mt-4 rounded-lg bg-muted p-4">
      <label className="block text-sm font-medium" htmlFor={`rating-${rental.id}`}>Rating</label>
      <select
        id={`rating-${rental.id}`}
        value={rating}
        onChange={(event) => setRating(Number(event.target.value))}
        className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 sm:w-40"
      >
        {[5, 4, 3, 2, 1].map((value) => (
          <option key={value} value={value}>{value} {value === 1 ? "star" : "stars"}</option>
        ))}
      </select>
      <label className="mt-3 block text-sm font-medium" htmlFor={`review-${rental.id}`}>Review</label>
      <textarea
        id={`review-${rental.id}`}
        required
        minLength={2}
        maxLength={2000}
        value={comment}
        onChange={(event) => setComment(event.target.value)}
        rows={3}
        placeholder="How was your rental experience?"
        className="mt-1 w-full resize-y rounded-md border border-input bg-background px-3 py-2"
      />
      {error && <p className="mt-2 text-sm text-red-600" role="alert">{error}</p>}
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
        >
          {submitting ? "Submitting..." : "Submit review"}
        </button>
        <button type="button" onClick={onCancel} className="rounded-md px-4 py-2 text-sm hover:bg-background">
          Cancel
        </button>
      </div>
    </form>
  );
}

export function CustomerDashboard() {
  const { user } = useAuth();
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [notice, setNotice] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [reviewingRental, setReviewingRental] = useState<string | null>(null);
  const [paymentInProgress, setPaymentInProgress] = useState<string | null>(null);

  const refreshRentals = useCallback(async (signal?: AbortSignal) => {
    const items = await rentalService.getRentals(signal);
    if (!signal?.aborted) {
      setRentals(items);
      setLoadError("");
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    refreshRentals(controller.signal)
      .catch((error: unknown) => {
        if (!controller.signal.aborted) setLoadError(getApiErrorMessage(error));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [refreshRentals]);

  const createRental = async (payload: CreateRentalPayload) => {
    await rentalService.createRental(payload);
    setModalOpen(false);
    setNotice("Rental request created.");
    try {
      await refreshRentals();
    } catch (error) {
      setLoadError(getApiErrorMessage(error));
    }
  };

  const payNow = async (rentalId: string) => {
    setPaymentInProgress(rentalId);
    setNotice("");
    try {
      const { gatewayUrl } = await rentalService.createPayment(rentalId);
      const gateway = new URL(gatewayUrl);
      if (!["https:", "http:"].includes(gateway.protocol)) {
        throw new Error("The payment gateway returned an invalid URL.");
      }
      window.location.assign(gateway.toString());
    } catch (error) {
      setNotice(getApiErrorMessage(error));
      setPaymentInProgress(null);
    }
  };

  const submitReview = async (rental: Rental, rating: number, comment: string) => {
    const gearId = rental.gearId ?? rental.gear?.id;
    if (!gearId) throw new Error("This rental is missing its gear reference.");
    await rentalService.createReview({ gearId, rentalId: rental.id, rating, comment });
    setReviewingRental(null);
    setRentals((current) =>
      current.map((item) =>
        item.id === rental.id ? { ...item, review: { rating, comment } } : item
      )
    );
    setNotice("Thanks for sharing your review.");
  };

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium text-primary">Customer dashboard</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">Welcome back, {user?.name ?? "there"}</h1>
          <p className="mt-2 text-muted-foreground">Manage your rentals, payments, and reviews.</p>
        </div>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 font-semibold text-primary-foreground hover:opacity-90"
        >
          <Plus className="h-4 w-4" aria-hidden />
          New rental
        </button>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total rentals", count: rentals.length, Icon: CalendarDays },
          { label: "Awaiting payment", count: rentals.filter(isConfirmed).length, Icon: CreditCard },
          { label: "Completed", count: rentals.filter(isCompleted).length, Icon: CheckCircle2 },
        ].map(({ label, count, Icon }) => (
          <div key={label} className="flex items-center gap-4 rounded-xl border border-border bg-card p-5">
            <span className="rounded-lg bg-primary/10 p-3 text-primary"><Icon className="h-5 w-5" aria-hidden /></span>
            <div><p className="text-sm text-muted-foreground">{label}</p><p className="text-2xl font-bold">{count}</p></div>
          </div>
        ))}
      </div>

      <section className="mt-10" aria-labelledby="rentals-heading">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="rentals-heading" className="text-2xl font-bold">Your rentals</h2>
            <p className="mt-1 text-sm text-muted-foreground">Track requests, confirmed bookings, and completed trips.</p>
          </div>
          <Link href="/gear" className="text-sm font-semibold text-primary hover:underline">Browse gear</Link>
        </div>
        {notice && (
          <div className="mt-4 flex items-start justify-between gap-4 rounded-lg border border-border bg-muted px-4 py-3 text-sm" role="status">
            <span>{notice}</span>
            <button type="button" onClick={() => setNotice("")} aria-label="Dismiss message" className="font-semibold">×</button>
          </div>
        )}
        {loading ? (
          <div className="mt-5 space-y-4" aria-label="Loading rentals">
            {[0, 1, 2].map((index) => <div key={index} className="h-40 animate-pulse rounded-xl bg-muted" />)}
          </div>
        ) : loadError ? (
          <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-5 text-sm text-red-800" role="alert">
            <p className="font-semibold">Could not load your rentals.</p>
            <p className="mt-1">{loadError}</p>
            <button
              type="button"
              onClick={() => {
                setLoading(true);
                refreshRentals().catch((error: unknown) => setLoadError(getApiErrorMessage(error))).finally(() => setLoading(false));
              }}
              className="mt-3 font-semibold underline"
            >
              Try again
            </button>
          </div>
        ) : rentals.length === 0 ? (
          <div className="mt-5 rounded-xl border border-dashed border-border px-6 py-14 text-center">
            <CalendarDays className="mx-auto h-9 w-9 text-muted-foreground" aria-hidden />
            <h3 className="mt-3 font-semibold">No rentals yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">Find gear for your next adventure and request your first rental.</p>
            <Link href="/gear" className="mt-4 inline-block rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Explore gear</Link>
          </div>
        ) : (
          <div className="mt-5 space-y-4">
            {rentals.map((rental) => {
              const title = rental.gear?.title ?? rental.gear?.name ?? "Gear rental";
              const total = rentalTotal(rental);
              const reviewed = Boolean(rental.review);
              return (
                <article key={rental.id} className="rounded-xl border border-border bg-card p-5 sm:p-6">
                  <div className="flex flex-col justify-between gap-5 sm:flex-row">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-semibold">{title}</h3>
                        <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium capitalize">
                          {rental.status.toLowerCase().replace(/[_-]/g, " ")}
                        </span>
                      </div>
                      <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                        <CalendarDays className="h-4 w-4" aria-hidden />
                        {rental.startDate} – {rental.endDate}
                      </p>
                      {typeof total === "number" && (
                        <p className="mt-2 font-semibold">{currency.format(total)}</p>
                      )}
                      {rental.gear?.id && (
                        <Link href={`/gear/${encodeURIComponent(rental.gear.id)}`} className="mt-3 inline-block text-sm font-medium text-primary hover:underline">
                          View gear
                        </Link>
                      )}
                    </div>
                    <div className="flex flex-wrap content-start gap-2">
                      {isConfirmed(rental) && (
                        <button
                          type="button"
                          onClick={() => payNow(rental.id)}
                          disabled={paymentInProgress === rental.id}
                          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
                        >
                          {paymentInProgress === rental.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" aria-hidden />}
                          {paymentInProgress === rental.id ? "Opening payment..." : "Pay Now"}
                        </button>
                      )}
                      {isCompleted(rental) && !reviewed && reviewingRental !== rental.id && (
                        <button
                          type="button"
                          onClick={() => setReviewingRental(rental.id)}
                          className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-semibold hover:bg-muted"
                        >
                          <MessageSquarePlus className="h-4 w-4" aria-hidden />
                          Leave a review
                        </button>
                      )}
                      {isCompleted(rental) && reviewed && (
                        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700">
                          <Star className="h-4 w-4 fill-current" aria-hidden />
                          Reviewed · {rental.review?.rating}/5
                        </span>
                      )}
                      {!isConfirmed(rental) && !isCompleted(rental) && (
                        <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Clock3 className="h-4 w-4" aria-hidden />
                          Payment available after confirmation
                        </span>
                      )}
                    </div>
                  </div>
                  {reviewingRental === rental.id && (
                    <ReviewForm
                      rental={rental}
                      onSubmit={(rating, comment) => submitReview(rental, rating, comment)}
                      onCancel={() => setReviewingRental(null)}
                    />
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>
      {modalOpen && (
        <RentalCreateModal
          onClose={() => setModalOpen(false)}
          onCreated={createRental}
        />
      )}
    </main>
  );
}
