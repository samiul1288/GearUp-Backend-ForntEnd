export interface GearProvider {
  id?: string;
  name: string;
  location?: string;
  rating?: number;
  reviewCount?: number;
}

export interface GearCategory {
  id: string;
  name: string;
  slug?: string;
  description?: string | null;
  icon?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface GearItem {
  id: string;
  name: string;
  category: string | GearCategory | null;
  categoryId?: string;
  description: string;
  pricePerDay: number;
  images?: string[];
  provider?: GearProvider;
  stock?: number;
  available?: boolean;
  location?: string;
  brand?: string;
}

export interface GearSearchParams {
  searchTerm?: string;
  categoryId?: string;
  location?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  isAvailable?: boolean;
}

export function getGearCategoryName(
  category: string | { name?: string | null } | null | undefined
): string {
  if (typeof category === "string") return category;
  if (category && typeof category.name === "string") return category.name;
  return "Uncategorized";
}
