import Link from "next/link";
import { MapPin, Package } from "lucide-react";
import { getGearCategoryName, type GearItem } from "@/types/gear";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function GearCard({ gear }: { gear: GearItem }) {
  const image = gear.images?.[0];
  const isAvailable = gear.available !== false && (gear.stock === undefined || gear.stock > 0);

  return (
    <article className="group overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-lg">
      <Link
        href={`/gear/${encodeURIComponent(gear.id)}`}
        className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={image}
              alt={gear.name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <Package className="h-12 w-12" aria-hidden />
              <span className="sr-only">No image available</span>
            </div>
          )}
          <span
            className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-semibold ${
              isAvailable ? "bg-white text-emerald-700" : "bg-white text-muted-foreground"
            }`}
          >
            {isAvailable ? "Available" : "Unavailable"}
          </span>
        </div>
        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wide text-primary">
                {getGearCategoryName(gear.category)}
              </p>
              <h2 className="mt-1 truncate text-lg font-semibold">{gear.name}</h2>
            </div>
            <p className="shrink-0 text-right font-bold">
              {currency.format(gear.pricePerDay)}
              <span className="block text-xs font-normal text-muted-foreground">/ day</span>
            </p>
          </div>
          {gear.location && (
            <p className="mt-3 flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" aria-hidden />
              <span className="truncate">{gear.location}</span>
            </p>
          )}
          <p className="mt-3 line-clamp-2 min-h-10 text-sm text-muted-foreground">
            {gear.description}
          </p>
        </div>
      </Link>
    </article>
  );
}
