import { categoryLabels, products, type Category, type Product, type Size } from "@/content/products";

export const SIZE_ORDER: Size[] = ["XS", "S", "M", "L", "XL", "2XL"];

export type SortKey = "featured" | "price-asc" | "price-desc" | "newest";

export interface CatalogueQuery {
  categories?: Category[];
  sizes?: Size[];
  /** Only show items with at least one size in stock. */
  inStockOnly?: boolean;
  onSaleOnly?: boolean;
  maxPrice?: number;
  search?: string;
  sort?: SortKey;
}

export function getProduct(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function totalUnits(product: Product): number {
  return product.stock.reduce((sum, s) => sum + s.units, 0);
}

export function isSoldOut(product: Product): boolean {
  return totalUnits(product) === 0;
}

export function availableSizes(product: Product): Size[] {
  return product.stock.filter((s) => s.units > 0).map((s) => s.size);
}

export function unitsFor(product: Product, size: Size): number {
  return product.stock.find((s) => s.size === size)?.units ?? 0;
}

/** Items with 1–3 units left drive the "only N left" urgency copy. */
export function lowStockSizes(product: Product): Size[] {
  return product.stock.filter((s) => s.units > 0 && s.units <= 3).map((s) => s.size);
}

function matchesSearch(product: Product, term: string): boolean {
  const haystack = [
    product.name,
    product.tagline,
    product.colourway,
    product.romaji,
    product.kanji,
    categoryLabels[product.category],
    product.story,
  ]
    .join(" ")
    .toLowerCase();
  return term
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((word) => haystack.includes(word));
}

const sorters: Record<SortKey, (a: Product, b: Product) => number> = {
  featured: (a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)) || a.name.localeCompare(b.name),
  "price-asc": (a, b) => a.price - b.price,
  "price-desc": (a, b) => b.price - a.price,
  newest: (a, b) => b.releasedAt.localeCompare(a.releasedAt) || a.name.localeCompare(b.name),
};

export function queryCatalogue(query: CatalogueQuery = {}, source: Product[] = products): Product[] {
  const { categories, sizes, inStockOnly, onSaleOnly, maxPrice, search, sort = "featured" } = query;

  const filtered = source.filter((product) => {
    if (categories?.length && !categories.includes(product.category)) return false;
    if (sizes?.length) {
      const available = availableSizes(product);
      if (!sizes.some((size) => available.includes(size))) return false;
    }
    if (inStockOnly && isSoldOut(product)) return false;
    if (onSaleOnly && !product.compareAt) return false;
    if (typeof maxPrice === "number" && product.price > maxPrice) return false;
    if (search?.trim() && !matchesSearch(product, search)) return false;
    return true;
  });

  return [...filtered].sort(sorters[sort]);
}

export function relatedProducts(product: Product, limit = 4): Product[] {
  const sameDrop = products.filter((p) => p.slug !== product.slug && p.drop === product.drop);
  const rest = products.filter((p) => p.slug !== product.slug && p.drop !== product.drop);
  return [...sameDrop, ...rest].slice(0, limit);
}

export function priceRange(source: Product[] = products): { min: number; max: number } {
  const prices = source.map((p) => p.price);
  return { min: Math.min(...prices), max: Math.max(...prices) };
}
