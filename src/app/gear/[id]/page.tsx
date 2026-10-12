"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { CalendarDays, Check, ChevronLeft, MapPin, Package, Star, X } from "lucide-react";
import { getApiErrorMessage } from "@/lib/api-client";
import { gearService } from "@/services/gear.service";
import { rentalService } from "@/services/rental.service";
import { getGearCategoryName, type GearItem } from "@/types/gear";
import type { GearReview } from "@/types/rental";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

function RentalModal({
  gear,
  onClose,
  onApply,
}: {
  gear: GearItem;
  onClose: () => void;
  onApply: (startDate: string, endDate: string) => Promise<void>;
}) {
  const today = new Date().toISOString().slice(0, 10);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!startDate || !endDate) {
      setError("Choose both a start and end date.");
      return;
    }
    if (endDate < startDate) {
      setError("The end date must be on or after the start date.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      await onApply(startDate, endDate);
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
        aria-labelledby="rental-modal-title"
        className="w-full max-w-lg rounded-t-2xl bg-background p-6 shadow-2xl sm:rounded-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Plan your rental</p>
            <h2 id="rental-modal-title" className="mt-1 text-xl font-bold">
              Choose your dates
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close rental dates"
            className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="mt-4 rounded-lg bg-muted p-3 text-sm">
          {gear.name} <span className="text-muted-foreground">·</span>{" "}
          <strong>{currency.format(gear.pricePerDay)} / day</strong>
        </p>
        <form onSubmit={handleSubmit} className="mt-5">
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
          {error && <p className="mt-3 text-sm text-red-600" role="alert">{error}</p>}
          <p className="mt-4 text-xs text-muted-foreground">
            Your date selection is an estimate; availability is confirmed with the provider.
          </p>
          <button
            type="submit"
            disabled={submitting}
            className="mt-5 w-full rounded-md bg-primary px-4 py-3 font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {submitting ? "Requesting rental..." : "Request rental"}
          </button>
        </form>
      </section>
    </div>
  );
}

export default function GearDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [gear, setGear] = useState<GearItem | null>(null);
  const [reviews, setReviews] = useState<GearReview[]>([]);
  const [reviewError, setReviewError] = useState("");
  const [selectedImage, setSelectedImage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [rentalModalOpen, setRentalModalOpen] = useState(false);
  const [rentalDates, setRentalDates] = useState<{ start: string; end: string } | null>(null);
  const [rentalCreated, setRentalCreated] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    setError("");
    setReviews([]);
    setReviewError("");
    gearService
      .getGearById(id, controller.signal)
      .then((item) => {
        setGear(item);
        setSelectedImage(0);
      })
      .catch((requestError: unknown) => {
        if (!controller.signal.aborted) setError(getApiErrorMessage(requestError));
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });
    rentalService
      .getGearReviews(id, controller.signal)
      .then(setReviews)
      .catch((requestError: unknown) => {
        if (!controller.signal.aborted) setReviewError(getApiErrorMessage(requestError));
      });
    return () => controller.abort();
  }, [id]);

  if (isLoading) {
    return (
      <main aria-label="Loading gear details" className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
          <div className="aspect-[4/3] animate-pulse rounded-xl bg-muted" />
          <div className="h-96 animate-pulse rounded-xl bg-muted" />
        </div>
      </main>
    );
  }

  if (error || !gear) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
        <h1 className="text-2xl font-bold">{error ? "Unable to load this gear" : "Gear not found"}</h1>
        {error && <p className="mt-2 text-sm text-muted-foreground">{error}</p>}
        <Link href="/gear" className="mt-5 inline-flex font-semibold text-primary hover:underline">
          <ChevronLeft className="mr-1 h-5 w-5" aria-hidden />
          Back to browsing
        </Link>
      </main>
    );
  }

  const images = gear.images?.filter(Boolean) ?? [];
  const available = gear.available !== false && (gear.stock === undefined || gear.stock > 0);
  const rentalDays = rentalDates
    ? Math.floor(
        (new Date(`${rentalDates.end}T00:00:00`).getTime() -
          new Date(`${rentalDates.start}T00:00:00`).getTime()) /
          86_400_000
      ) + 1
    : 0;

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <Link href="/gear" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground">
        <ChevronLeft className="mr-1 h-4 w-4" aria-hidden />
        Browse gear
      </Link>

      <div className="mt-5 grid items-start gap-8 lg:grid-cols-[1.35fr_1fr]">
        <section aria-label="Gear image gallery">
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-muted">
            {images[selectedImage] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={images[selectedImage]}
                alt={`${gear.name}, image ${selectedImage + 1}`}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                <Package className="h-16 w-16" aria-hidden />
                <span className="sr-only">No image available</span>
              </div>
            )}
            {images.length > 1 && (
              <span className="absolute bottom-3 right-3 rounded-full bg-black/60 px-3 py-1 text-sm text-white">
                {selectedImage + 1} / {images.length}
              </span>
            )}
          </div>
          {images.length > 1 && (
            <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
              {images.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  onClick={() => setSelectedImage(index)}
                  aria-label={`Show image ${index + 1}`}
                  aria-pressed={selectedImage === index}
                  className={`h-20 w-24 shrink-0 overflow-hidden rounded-lg border-2 ${
                    selectedImage === index ? "border-primary" : "border-transparent"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={image} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </section>

        <section>
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">
            {getGearCategoryName(gear.category)}
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">{gear.name}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
            {(gear.location || gear.provider?.location) && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-4 w-4" aria-hidden />
                {gear.location || gear.provider?.location}
              </span>
            )}
            {typeof gear.provider?.rating === "number" && (
              <span className="inline-flex items-center gap-1">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" aria-hidden />
                {gear.provider.rating.toFixed(1)}
                {gear.provider.reviewCount !== undefined && ` (${gear.provider.reviewCount} reviews)`}
              </span>
            )}
          </div>

          <div className="mt-6 rounded-xl border border-border bg-card p-5">
            <p className="text-3xl font-bold">
              {currency.format(gear.pricePerDay)}
              <span className="ml-1 text-base font-normal text-muted-foreground">/ day</span>
            </p>
            <p className={`mt-3 flex items-center gap-2 text-sm font-medium ${available ? "text-emerald-700" : "text-red-600"}`}>
              {available ? <Check className="h-4 w-4" /> : <Package className="h-4 w-4" />}
              {available
                ? gear.stock !== undefined
                  ? `${gear.stock} available`
                  : "Available to rent"
                : "Currently unavailable"}
            </p>
            <button
              type="button"
              disabled={!available}
              onClick={() => setRentalModalOpen(true)}
              className="mt-5 w-full rounded-md bg-primary px-4 py-3 font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Rent Now
            </button>
            {rentalDates && (
              <div className="mt-4 rounded-lg bg-muted p-3 text-sm">
                <p className="flex items-center gap-2 font-semibold">
                  <CalendarDays className="h-4 w-4" aria-hidden />
                  {rentalCreated ? "Rental request submitted" : "Selected rental dates"}
                </p>
                <p className="mt-1 text-muted-foreground">
                  {rentalDates.start} – {rentalDates.end} · {rentalDays}{" "}
                  {rentalDays === 1 ? "day" : "days"}
                </p>
                <p className="mt-1 font-semibold">
                  Estimated total: {currency.format(gear.pricePerDay * rentalDays)}
                </p>
              </div>
            )}
          </div>

          <div className="mt-7 border-t border-border pt-6">
            <h2 className="text-lg font-semibold">About this gear</h2>
            <p className="mt-2 whitespace-pre-line leading-7 text-muted-foreground">
              {gear.description || "No description has been provided for this item."}
            </p>
          </div>

          <div className="mt-6 rounded-xl border border-border p-5">
            <p className="text-sm text-muted-foreground">Provided by</p>
            <p className="mt-1 font-semibold">{gear.provider?.name ?? "GearUp provider"}</p>
            {(gear.provider?.location || gear.location) && (
              <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" aria-hidden />
                {gear.provider?.location || gear.location}
              </p>
            )}
          </div>
        </section>
      </div>
      <section className="mt-12 border-t border-border pt-8" aria-labelledby="reviews-heading">
        <h2 id="reviews-heading" className="text-2xl font-bold">Reviews</h2>
        {reviewError ? (
          <p className="mt-3 text-sm text-red-600" role="alert">
            Reviews could not be loaded: {reviewError}
          </p>
        ) : reviews.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">No reviews yet.</p>
        ) : (
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {reviews.map((review) => (
              <article key={review.id} className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-center justify-between gap-4">
                  <p className="font-semibold">{review.user?.name ?? "GearUp customer"}</p>
                  <p className="flex items-center gap-1 text-sm font-medium">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" aria-hidden />
                    {review.rating}/5
                  </p>
                </div>
                <p className="mt-3 whitespace-pre-line text-sm leading-6 text-muted-foreground">
                  {review.comment}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>
      {rentalModalOpen && (
        <RentalModal
          gear={gear}
          onClose={() => setRentalModalOpen(false)}
          onApply={async (start, end) => {
            await rentalService.createRental({
              gearId: gear.id,
              startDate: start,
              endDate: end,
            });
            setRentalDates({ start, end });
            setRentalCreated(true);
            setRentalModalOpen(false);
          }}
        />
      )}
    </main>
  );
}
