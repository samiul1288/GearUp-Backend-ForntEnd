"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { CalendarDays, ImagePlus, Loader2, Package, Pencil, Plus, Trash2 } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { getApiErrorMessage } from "@/lib/api-client";
import { gearService } from "@/services/gear.service";
import { providerService } from "@/services/provider.service";
import { getGearCategoryName, type GearCategory, type GearItem } from "@/types/gear";
import type { ProviderGearPayload, ProviderOrder, ProviderOrderStatus } from "@/types/provider";

type DashboardTab = "gear" | "orders";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

const ORDER_FLOW: ProviderOrderStatus[] = ["PENDING", "APPROVED", "ACTIVE", "COMPLETED"];

const STATUS_LABEL: Record<ProviderOrderStatus, string> = {
  PENDING: "Pending",
  APPROVED: "Approved",
  ACTIVE: "Active",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  REJECTED: "Rejected",
};

function GearFormModal({
  item,
  onClose,
  onSave,
}: {
  item: GearItem | null;
  onClose: () => void;
  onSave: (payload: ProviderGearPayload) => Promise<void>;
}) {
  const [name, setName] = useState(item?.name ?? "");
  const [categoryId, setCategoryId] = useState(
    item?.categoryId ??
      (item?.category && typeof item.category === "object" ? item.category.id : "")
  );
  const [description, setDescription] = useState(item?.description ?? "");
  const [pricePerDay, setPricePerDay] = useState(item ? String(item.pricePerDay) : "");
  const [location, setLocation] = useState(item?.location ?? "");
  const [brand, setBrand] = useState(item?.brand ?? "");
  const [isAvailable, setIsAvailable] = useState(item?.available ?? true);
  const [images, setImages] = useState(item?.images?.join("\n") ?? "");
  const [categories, setCategories] = useState<GearCategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    gearService
      .getCategories(controller.signal)
      .then((items) => {
        setCategories(items);
        setCategoryId((current) => current || items[0]?.id || "");
      })
      .catch((requestError: unknown) => {
        if (!controller.signal.aborted) {
          setCategoriesError(getApiErrorMessage(requestError));
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setCategoriesLoading(false);
      });
    return () => controller.abort();
  }, []);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsedPrice = Number(pricePerDay);
    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      setError("Enter a price greater than zero.");
      return;
    }
    if (!categories.some((category) => category.id === categoryId)) {
      setError("Choose a valid gear category.");
      return;
    }
    const imageUrls = images
      .split(/\r?\n/)
      .map((image) => image.trim())
      .filter(Boolean);
    if (imageUrls.some((image) => {
      try {
        const url = new URL(image);
        return url.protocol !== "https:" && url.protocol !== "http:";
      } catch {
        return true;
      }
    })) {
      setError("Enter valid http or https image URLs, one per line.");
      return;
    }

    setError("");
    setSaving(true);
    try {
      await onSave({
        title: name.trim(),
        categoryId,
        description: description.trim(),
        pricePerDay: parsedPrice,
        location: location.trim(),
        brand: brand.trim(),
        isAvailable,
        images: imageUrls,
        specifications: {},
      });
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setSaving(false);
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
        aria-labelledby="gear-form-title"
        className="max-h-[95vh] w-full max-w-xl overflow-y-auto rounded-t-2xl bg-background p-6 shadow-2xl sm:rounded-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">{item ? "Update your listing" : "Add a new listing"}</p>
            <h2 id="gear-form-title" className="mt-1 text-xl font-bold">
              {item ? "Edit gear" : "List your gear"}
            </h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted">
            Close
          </button>
        </div>
        <form onSubmit={submit} className="mt-5 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium">
              Item name
              <input required maxLength={120} value={name} onChange={(event) => setName(event.target.value)} className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2" />
            </label>
            <label className="text-sm font-medium">
              Category
              <select
                required
                value={categoryId}
                onChange={(event) => setCategoryId(event.target.value)}
                disabled={categoriesLoading || Boolean(categoriesError) || !categories.length}
                className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2"
              >
                {categoriesLoading ? (
                  <option value="">Loading categories...</option>
                ) : categories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </label>
          </div>
          {categoriesError && <p className="text-sm text-red-600" role="alert">Categories could not be loaded: {categoriesError}</p>}
          <label className="block text-sm font-medium">
            Description
            <textarea required maxLength={4000} rows={3} value={description} onChange={(event) => setDescription(event.target.value)} className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2" />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium">
              Price per day
              <span className="mt-1.5 flex items-center rounded-md border border-input px-3">
                <span aria-hidden>$</span>
                <input required type="number" min="0.01" step="0.01" value={pricePerDay} onChange={(event) => setPricePerDay(event.target.value)} className="w-full border-0 bg-transparent py-2 pl-2 outline-none focus:ring-0" />
              </span>
            </label>
            <label className="text-sm font-medium">
              Location
              <input maxLength={160} value={location} onChange={(event) => setLocation(event.target.value)} className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2" />
            </label>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium">
              Brand
              <input maxLength={120} value={brand} onChange={(event) => setBrand(event.target.value)} className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2" />
            </label>
            <label className="flex items-center gap-2 self-end pb-2 text-sm font-medium">
              <input type="checkbox" checked={isAvailable} onChange={(event) => setIsAvailable(event.target.checked)} className="rounded border-input text-primary focus:ring-primary" />
              Available for rent
            </label>
          </div>
          <label className="block text-sm font-medium">
            Image URLs
            <span className="mt-1.5 flex items-start gap-2 rounded-md border border-input px-3">
              <ImagePlus className="mt-3 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
              <textarea
                rows={3}
                value={images}
                onChange={(event) => setImages(event.target.value)}
                placeholder={"https://example.com/gear-front.jpg\nhttps://example.com/gear-side.jpg"}
                className="w-full resize-y border-0 bg-transparent py-2 outline-none focus:ring-0"
              />
            </span>
            <span className="mt-1 block text-xs font-normal text-muted-foreground">Add one image URL per line.</span>
          </label>
          {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
          <button type="submit" disabled={saving} className="w-full rounded-md bg-primary px-4 py-3 font-semibold text-primary-foreground disabled:opacity-50">
            {saving ? "Saving..." : item ? "Save changes" : "Create listing"}
          </button>
        </form>
      </section>
    </div>
  );
}

function statusForOrder(order: ProviderOrder): ProviderOrderStatus {
  return order.status;
}

export function ProviderDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<DashboardTab>("gear");
  const [gear, setGear] = useState<GearItem[]>([]);
  const [orders, setOrders] = useState<ProviderOrder[]>([]);
  const [loadingGear, setLoadingGear] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [gearError, setGearError] = useState("");
  const [ordersError, setOrdersError] = useState("");
  const [notice, setNotice] = useState("");
  const [editingGear, setEditingGear] = useState<GearItem | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [deletingGearId, setDeletingGearId] = useState<string | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  const loadGear = useCallback(async (signal?: AbortSignal) => {
    try {
      const items = await providerService.getGear(signal);
      if (!signal?.aborted) {
        setGear(items);
        setGearError("");
      }
    } catch (error) {
      if (!signal?.aborted) setGearError(getApiErrorMessage(error));
    } finally {
      if (!signal?.aborted) setLoadingGear(false);
    }
  }, []);

  const loadOrders = useCallback(async (signal?: AbortSignal) => {
    setLoadingOrders(true);
    try {
      const items = await providerService.getOrders(signal);
      if (!signal?.aborted) {
        setOrders(items);
        setOrdersError("");
      }
    } catch (error) {
      if (!signal?.aborted) setOrdersError(getApiErrorMessage(error));
    } finally {
      if (!signal?.aborted) setLoadingOrders(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void loadGear(controller.signal);
    return () => controller.abort();
  }, [loadGear]);

  useEffect(() => {
    if (activeTab !== "orders") return;
    const controller = new AbortController();
    void loadOrders(controller.signal);
    return () => controller.abort();
  }, [activeTab, loadOrders]);

  const saveGear = async (payload: ProviderGearPayload) => {
    if (editingGear) {
      const updated = await providerService.updateGear(editingGear.id, payload);
      setGear((current) => current.map((item) => item.id === updated.id ? updated : item));
      setNotice("Gear listing updated.");
    } else {
      const created = await providerService.createGear(payload);
      setGear((current) => [created, ...current]);
      setNotice("Gear listing created.");
    }
    setCreateModalOpen(false);
    setEditingGear(null);
  };

  const deleteGear = async (item: GearItem) => {
    if (!window.confirm(`Delete "${item.name}"? This cannot be undone.`)) return;
    setDeletingGearId(item.id);
    setNotice("");
    try {
      await providerService.deleteGear(item.id);
      setGear((current) => current.filter((entry) => entry.id !== item.id));
      setNotice("Gear listing deleted.");
    } catch (error) {
      setGearError(getApiErrorMessage(error));
    } finally {
      setDeletingGearId(null);
    }
  };

  const updateStatus = async (order: ProviderOrder, status: ProviderOrderStatus) => {
    const currentStatus = statusForOrder(order);
    const currentIndex = ORDER_FLOW.indexOf(currentStatus);
    const nextStatus = ORDER_FLOW[currentIndex + 1];
    if (status !== nextStatus) return;
    setUpdatingOrderId(order.id);
    setOrdersError("");
    try {
      const updated = await providerService.updateOrderStatus(order.id, status);
      setOrders((current) => current.map((entry) => entry.id === order.id ? updated : entry));
      setNotice(`Order status updated to ${STATUS_LABEL[status]}.`);
    } catch (error) {
      setOrdersError(getApiErrorMessage(error));
    } finally {
      setUpdatingOrderId(null);
    }
  };

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <div>
        <p className="text-sm font-medium text-primary">Provider dashboard</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">Welcome, {user?.name ?? "provider"}</h1>
        <p className="mt-2 text-muted-foreground">Manage your gear listings and rental orders.</p>
      </div>

      <div className="mt-8 border-b border-border">
        <div className="flex gap-6" role="tablist" aria-label="Provider dashboard sections">
          <button
            type="button"
            id="manage-gear-tab"
            role="tab"
            aria-selected={activeTab === "gear"}
            aria-controls="manage-gear-panel"
            onClick={() => setActiveTab("gear")}
            className={`border-b-2 px-1 pb-3 text-sm font-semibold ${activeTab === "gear" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          >
            Manage Gear
          </button>
          <button
            type="button"
            id="incoming-orders-tab"
            role="tab"
            aria-selected={activeTab === "orders"}
            aria-controls="incoming-orders-panel"
            onClick={() => setActiveTab("orders")}
            className={`border-b-2 px-1 pb-3 text-sm font-semibold ${activeTab === "orders" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          >
            Incoming Orders
          </button>
        </div>
      </div>

      {notice && (
        <div className="mt-5 flex items-center justify-between gap-4 rounded-lg border border-border bg-muted px-4 py-3 text-sm" role="status">
          <span>{notice}</span>
          <button type="button" onClick={() => setNotice("")} aria-label="Dismiss message" className="font-semibold">×</button>
        </div>
      )}

      {activeTab === "gear" ? (
        <section id="manage-gear-panel" role="tabpanel" aria-labelledby="manage-gear-tab" className="pt-6">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-2xl font-bold">Manage Gear</h2>
              <p className="mt-1 text-sm text-muted-foreground">Keep your rental catalog up to date.</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setEditingGear(null);
                setCreateModalOpen(true);
              }}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 font-semibold text-primary-foreground hover:opacity-90"
            >
              <Plus className="h-4 w-4" aria-hidden />
              Add gear
            </button>
          </div>

          {gearError && (
            <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800" role="alert">
              <p className="font-semibold">There was a problem with gear listings.</p>
              <p className="mt-1">{gearError}</p>
              <button type="button" onClick={() => { setLoadingGear(true); void loadGear(); }} className="mt-2 font-semibold underline">Try again</button>
            </div>
          )}
          {loadingGear ? (
            <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-label="Loading gear listings">
              {[0, 1, 2].map((index) => <div key={index} className="h-72 animate-pulse rounded-xl bg-muted" />)}
            </div>
          ) : gear.length === 0 && !gearError ? (
            <div className="mt-5 rounded-xl border border-dashed border-border px-6 py-14 text-center">
              <Package className="mx-auto h-9 w-9 text-muted-foreground" aria-hidden />
              <h3 className="mt-3 font-semibold">No gear listings yet</h3>
              <p className="mt-1 text-sm text-muted-foreground">Add your first item to make it available for rent.</p>
            </div>
          ) : (
            <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {gear.map((item) => (
                <article key={item.id} className="overflow-hidden rounded-xl border border-border bg-card">
                  <div className="aspect-[4/3] bg-muted">
                    {item.images?.[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.images[0]} alt={item.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-muted-foreground"><Package className="h-10 w-10" aria-hidden /></div>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                      {getGearCategoryName(item.category)}
                    </p>
                    <h3 className="mt-1 truncate font-semibold">{item.name}</h3>
                    <div className="mt-2 flex items-center justify-between gap-2 text-sm text-muted-foreground">
                      <span>{currency.format(item.pricePerDay)} / day</span>
                      <span>{item.available ? "Available" : "Unavailable"}</span>
                    </div>
                    <p className="mt-2 line-clamp-2 min-h-10 text-sm text-muted-foreground">{item.description}</p>
                    <div className="mt-4 flex gap-2 border-t border-border pt-3">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingGear(item);
                          setCreateModalOpen(true);
                        }}
                        className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-md border border-border px-3 py-2 text-sm font-semibold hover:bg-muted"
                      >
                        <Pencil className="h-4 w-4" aria-hidden />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => void deleteGear(item)}
                        disabled={deletingGearId === item.id}
                        className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-md border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
                      >
                        {deletingGearId === item.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" aria-hidden />}
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      ) : (
        <section id="incoming-orders-panel" role="tabpanel" aria-labelledby="incoming-orders-tab" className="pt-6">
          <div>
            <h2 className="text-2xl font-bold">Incoming Orders</h2>
            <p className="mt-1 text-sm text-muted-foreground">Move rentals through each fulfillment stage.</p>
          </div>
          {ordersError && (
            <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800" role="alert">
              <p className="font-semibold">Could not load or update orders.</p>
              <p className="mt-1">{ordersError}</p>
              <button type="button" onClick={() => void loadOrders()} className="mt-2 font-semibold underline">Try again</button>
            </div>
          )}
          {loadingOrders ? (
            <div className="mt-5 space-y-4" aria-label="Loading orders">
              {[0, 1, 2].map((index) => <div key={index} className="h-36 animate-pulse rounded-xl bg-muted" />)}
            </div>
          ) : orders.length === 0 && !ordersError ? (
            <div className="mt-5 rounded-xl border border-dashed border-border px-6 py-14 text-center">
              <CalendarDays className="mx-auto h-9 w-9 text-muted-foreground" aria-hidden />
              <h3 className="mt-3 font-semibold">No incoming orders</h3>
              <p className="mt-1 text-sm text-muted-foreground">New rental requests will show here.</p>
            </div>
          ) : (
            <div className="mt-5 space-y-4">
              {orders.map((order) => {
                const status = statusForOrder(order);
                const statusIndex = ORDER_FLOW.indexOf(status);
                const nextStatus = statusIndex >= 0 ? ORDER_FLOW[statusIndex + 1] : undefined;
                return (
                  <article key={order.id} className="flex flex-col justify-between gap-5 rounded-xl border border-border bg-card p-5 sm:flex-row sm:items-center sm:p-6">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-semibold">
                          {order.gear?.title ?? order.gear?.name ?? "Gear rental"}
                        </h3>
                        <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">{STATUS_LABEL[status]}</span>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Customer: {order.customer?.name ?? order.customer?.email ?? "Customer"}
                      </p>
                      <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                        <CalendarDays className="h-4 w-4" aria-hidden />
                        {order.startDate} – {order.endDate}
                      </p>
                      {(order.totalAmount !== undefined || order.totalPrice !== undefined) && (
                        <p className="mt-2 text-sm font-semibold">
                          {currency.format(order.totalAmount ?? order.totalPrice ?? 0)}
                        </p>
                      )}
                    </div>
                    {nextStatus ? (
                      <label className="shrink-0 text-sm font-medium">
                        Update status
                        <span className="mt-1.5 flex items-center gap-2">
                          <select
                            value=""
                            disabled={updatingOrderId === order.id}
                            onChange={(event) => {
                              if (event.target.value) void updateStatus(order, event.target.value as ProviderOrderStatus);
                            }}
                            className="min-w-40 rounded-md border border-input bg-background px-3 py-2 disabled:opacity-60"
                          >
                            <option value="">Choose next step</option>
                            <option value={nextStatus}>{STATUS_LABEL[nextStatus]}</option>
                          </select>
                          {updatingOrderId === order.id && <Loader2 className="h-4 w-4 animate-spin text-primary" aria-label="Updating order" />}
                        </span>
                      </label>
                    ) : (
                      <span className="shrink-0 text-sm font-medium text-muted-foreground">
                        {STATUS_LABEL[status]}
                      </span>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>
      )}

      {(createModalOpen || editingGear) && (
        <GearFormModal
          item={editingGear}
          onClose={() => {
            setCreateModalOpen(false);
            setEditingGear(null);
          }}
          onSave={saveGear}
        />
      )}
    </main>
  );
}
