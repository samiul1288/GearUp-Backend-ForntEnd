"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal } from "lucide-react";
import { getApiErrorMessage } from "@/lib/api-client";
import { gearService } from "@/services/gear.service";
import type { GearCategory, GearItem, GearSearchParams } from "@/types/gear";
import { GearCard } from "./gear-card";

export function GearBrowser() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryString = searchParams.toString();
  const currentSearch = searchParams.get("search") ?? "";
  const currentCategoryId = searchParams.get("categoryId") ?? "";
  const currentMin = searchParams.get("minPrice") ?? "";
  const currentMax = searchParams.get("maxPrice") ?? "";
  const [search, setSearch] = useState(currentSearch);
  const [minPrice, setMinPrice] = useState(currentMin);
  const [maxPrice, setMaxPrice] = useState(currentMax);
  const [items, setItems] = useState<GearItem[]>([]);
  const [categories, setCategories] = useState<GearCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [error, setError] = useState("");
  const [categoryError, setCategoryError] = useState("");
  const [filterError, setFilterError] = useState("");

  useEffect(() => {
    setSearch(currentSearch);
    setMinPrice(currentMin);
    setMaxPrice(currentMax);
  }, [currentSearch, currentMin, currentMax]);

  useEffect(() => {
    const controller = new AbortController();
    gearService
      .getCategories(controller.signal)
      .then(setCategories)
      .catch((requestError: unknown) => {
        if (!controller.signal.aborted) setCategoryError(getApiErrorMessage(requestError));
      })
      .finally(() => {
        if (!controller.signal.aborted) setCategoriesLoading(false);
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const params: GearSearchParams = {
      searchTerm: searchParams.get("search") || undefined,
      categoryId: searchParams.get("categoryId") || undefined,
      minPrice: searchParams.has("minPrice")
        ? Number(searchParams.get("minPrice"))
        : undefined,
      maxPrice: searchParams.has("maxPrice")
        ? Number(searchParams.get("maxPrice"))
        : undefined,
    };

    setIsLoading(true);
    setError("");
    gearService
      .getGear(params, controller.signal)
      .then(setItems)
      .catch((requestError: unknown) => {
        if (!controller.signal.aborted) {
          setError(getApiErrorMessage(requestError));
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [queryString, searchParams]);

  const updateQuery = (updates: Record<string, string>, remove: string[] = []) => {
    const params = new URLSearchParams(queryString);
    remove.forEach((key) => params.delete(key));
    Object.entries(updates).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    router.replace(`/gear${params.size ? `?${params.toString()}` : ""}`, { scroll: false });
  };

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    updateQuery({ search: search.trim() });
  };

  const handlePriceFilter = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const min = minPrice === "" ? undefined : Number(minPrice);
    const max = maxPrice === "" ? undefined : Number(maxPrice);
    if ((min !== undefined && (!Number.isFinite(min) || min < 0)) ||
        (max !== undefined && (!Number.isFinite(max) || max < 0))) {
      setFilterError("Enter valid, non-negative prices.");
      return;
    }
    if (min !== undefined && max !== undefined && min > max) {
      setFilterError("Minimum price must be less than or equal to maximum price.");
      return;
    }
    setFilterError("");
    updateQuery({
      minPrice: min === undefined ? "" : String(min),
      maxPrice: max === undefined ? "" : String(max),
    });
  };

  return (
    <main>
      <section className="bg-slate-950 text-white">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-300">
            Find your next adventure
          </p>
          <h1 className="mt-3 max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
            The right gear makes every trip better.
          </h1>
          <p className="mt-4 max-w-xl text-base text-slate-300 sm:text-lg">
            Rent quality gear from people in your community. Browse, compare, and get out there.
          </p>
          <form
            onSubmit={handleSearch}
            className="mt-8 flex max-w-2xl gap-2 rounded-xl bg-white p-2 shadow-lg"
            role="search"
          >
            <Search className="ml-2 mt-2.5 h-5 w-5 shrink-0 text-slate-500" aria-hidden />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search tents, bikes, cameras..."
              aria-label="Search gear"
              className="min-w-0 flex-1 border-0 bg-transparent px-1 py-2 text-slate-900 outline-none placeholder:text-slate-500 focus:ring-0"
            />
            <button
              type="submit"
              className="rounded-lg bg-primary px-5 py-2 font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Search
            </button>
          </form>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[240px_1fr]">
        <aside className="h-fit rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-primary" aria-hidden />
            <h2 className="font-semibold">Filters</h2>
          </div>
          <fieldset className="mt-6">
            <legend className="text-sm font-semibold">Category</legend>
            <div className="mt-3 space-y-2.5">
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="categoryId"
                  checked={!currentCategoryId}
                  onChange={() => updateQuery({ categoryId: "" }, ["category"])}
                  className="text-primary focus:ring-primary"
                />
                All gear
              </label>
              {categoriesLoading ? (
                <div className="space-y-2" aria-label="Loading categories">
                  {[0, 1, 2].map((index) => (
                    <div key={index} className="h-4 animate-pulse rounded bg-muted" />
                  ))}
                </div>
              ) : categoryError ? (
                <p className="text-xs text-red-600" role="alert">
                  Categories could not be loaded: {categoryError}
                </p>
              ) : (
                categories.map((category) => (
                  <label key={category.id} className="flex cursor-pointer items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="categoryId"
                      value={category.id}
                      checked={currentCategoryId === category.id}
                      onChange={() => updateQuery({ categoryId: category.id }, ["category"])}
                      className="text-primary focus:ring-primary"
                    />
                    {category.name}
                  </label>
                ))
              )}
            </div>
          </fieldset>

          <form onSubmit={handlePriceFilter} className="mt-7 border-t border-border pt-5">
            <h3 className="text-sm font-semibold">Price per day</h3>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <label className="text-xs text-muted-foreground">
                Min
                <span className="mt-1 flex items-center rounded-md border border-input px-2">
                  <span aria-hidden>$</span>
                  <input
                    type="number"
                    min="0"
                    value={minPrice}
                    onChange={(event) => setMinPrice(event.target.value)}
                    placeholder="0"
                    aria-label="Minimum price per day"
                    className="w-full border-0 bg-transparent py-2 pl-1 text-sm text-foreground outline-none focus:ring-0"
                  />
                </span>
              </label>
              <label className="text-xs text-muted-foreground">
                Max
                <span className="mt-1 flex items-center rounded-md border border-input px-2">
                  <span aria-hidden>$</span>
                  <input
                    type="number"
                    min="0"
                    value={maxPrice}
                    onChange={(event) => setMaxPrice(event.target.value)}
                    placeholder="Any"
                    aria-label="Maximum price per day"
                    className="w-full border-0 bg-transparent py-2 pl-1 text-sm text-foreground outline-none focus:ring-0"
                  />
                </span>
              </label>
            </div>
            {filterError && (
              <p className="mt-2 text-xs text-red-600" role="alert">
                {filterError}
              </p>
            )}
            <button
              type="submit"
              className="mt-3 w-full rounded-md border border-border px-3 py-2 text-sm font-semibold transition-colors hover:bg-muted"
            >
              Apply price
            </button>
          </form>
        </aside>

        <section aria-labelledby="results-heading">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-2">
            <div>
              <p className="text-sm text-muted-foreground">Explore the collection</p>
              <h2 id="results-heading" className="text-2xl font-bold">
                {categories.find((category) => category.id === currentCategoryId)?.name ??
                  "Available gear"}
              </h2>
            </div>
            {!isLoading && !error && (
              <p className="text-sm text-muted-foreground">
                {items.length} {items.length === 1 ? "item" : "items"}
              </p>
            )}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3" aria-label="Loading gear">
              {Array.from({ length: 6 }, (_, index) => (
                <div key={index} className="overflow-hidden rounded-xl border border-border">
                  <div className="aspect-[4/3] animate-pulse bg-muted" />
                  <div className="space-y-3 p-4">
                    <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
                    <div className="h-5 w-2/3 animate-pulse rounded bg-muted" />
                    <div className="h-4 w-full animate-pulse rounded bg-muted" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-800" role="alert">
              <p className="font-semibold">We couldn&apos;t load gear right now.</p>
              <p className="mt-1">{error}</p>
            </div>
          ) : items.length ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {items.map((item) => <GearCard key={item.id} gear={item} />)}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border px-6 py-16 text-center">
              <p className="text-lg font-semibold">No gear found</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Try another search or adjust your filters.
              </p>
              <button
                type="button"
                onClick={() => router.replace("/gear")}
                className="mt-4 rounded-md px-3 py-2 text-sm font-semibold text-primary hover:bg-muted"
              >
                Clear all filters
              </button>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
