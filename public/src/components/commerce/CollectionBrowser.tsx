"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { categoryLabels, type Category, type Size } from "@/content/products";
import { queryCatalogue, SIZE_ORDER, type SortKey } from "@/lib/catalogue";
import { cx } from "@/lib/cx";
import { ProductGrid } from "./ProductGrid";

const CATEGORIES: Category[] = ["tee", "hoodie", "pant", "headwear"];

const SORTS: { id: SortKey; label: string }[] = [
  { id: "featured", label: "Featured" },
  { id: "newest", label: "Newest" },
  { id: "price-asc", label: "Price ↑" },
  { id: "price-desc", label: "Price ↓" },
];

/**
 * Collection browser.
 *
 * Filter state lives in the URL, not in React — so the back button works, a
 * filtered view can be shared or bookmarked, and /drop?size=L from the Fit Lab
 * lands exactly where it should.
 */
export function CollectionBrowser() {
  const router = useRouter();
  const params = useSearchParams();

  const selectedCategories = params.getAll("category").filter((value): value is Category =>
    CATEGORIES.includes(value as Category),
  );
  const selectedSizes = params.getAll("size").filter((value): value is Size => SIZE_ORDER.includes(value as Size));
  const inStockOnly = params.get("stock") === "in";
  const onSaleOnly = params.get("sale") === "1";
  const sort = (params.get("sort") as SortKey) ?? "featured";
  const search = params.get("q") ?? "";

  // Filtering fifteen products is cheap; memoising it would cost more in
  // dependency bookkeeping than it saves.
  const results = queryCatalogue({
    categories: selectedCategories,
    sizes: selectedSizes,
    inStockOnly,
    onSaleOnly,
    sort: SORTS.some((option) => option.id === sort) ? sort : "featured",
    search,
  });

  /** Every filter change is a URL change — that is the whole state model. */
  const update = (mutate: (next: URLSearchParams) => void) => {
    const next = new URLSearchParams(params.toString());
    mutate(next);
    const query = next.toString();
    router.replace(query ? `/drop?${query}` : "/drop", { scroll: false });
  };

  const toggleMulti = (key: "category" | "size", value: string) =>
    update((next) => {
      const current = next.getAll(key);
      next.delete(key);
      const updated = current.includes(value) ? current.filter((item) => item !== value) : [...current, value];
      updated.forEach((item) => next.append(key, item));
    });

  const toggleFlag = (key: string, value: string) =>
    update((next) => {
      if (next.get(key) === value) next.delete(key);
      else next.set(key, value);
    });

  const activeCount =
    selectedCategories.length + selectedSizes.length + (inStockOnly ? 1 : 0) + (onSaleOnly ? 1 : 0) + (search ? 1 : 0);

  return (
    <div>
      <div className="sticky top-[6.5rem] z-30 -mx-[var(--page-gutter)] mb-8 border-y border-bone/10 bg-sumi/95 px-[var(--page-gutter)] py-3 backdrop-blur">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <FilterRow label="Type">
            {CATEGORIES.map((category) => (
              <Chip
                key={category}
                active={selectedCategories.includes(category)}
                onClick={() => toggleMulti("category", category)}
              >
                {categoryLabels[category]}
              </Chip>
            ))}
          </FilterRow>

          <FilterRow label="Size">
            {SIZE_ORDER.map((size) => (
              <Chip key={size} active={selectedSizes.includes(size)} onClick={() => toggleMulti("size", size)}>
                {size}
              </Chip>
            ))}
          </FilterRow>

          <FilterRow label="Show">
            <Chip active={inStockOnly} onClick={() => toggleFlag("stock", "in")}>
              In stock
            </Chip>
            <Chip active={onSaleOnly} onClick={() => toggleFlag("sale", "1")}>
              On sale
            </Chip>
          </FilterRow>

          <div className="ml-auto flex items-center gap-3">
            <label htmlFor="sort" className="label">
              Sort
            </label>
            <select
              id="sort"
              value={sort}
              onChange={(event) => update((next) => next.set("sort", event.target.value))}
              className="h-9 border border-bone/20 bg-sumi px-2 font-mono text-[0.68rem] uppercase tracking-[0.12em] text-bone outline-none focus:border-oxide"
            >
              {SORTS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="label" role="status" aria-live="polite">
          {results.length} {results.length === 1 ? "piece" : "pieces"}
          {search ? ` matching “${search}”` : ""}
        </p>
        {activeCount > 0 ? (
          <button
            type="button"
            onClick={() => router.replace("/drop", { scroll: false })}
            className="font-mono text-[0.68rem] uppercase tracking-[0.14em] text-oxide underline underline-offset-4"
          >
            Clear {activeCount} filter{activeCount === 1 ? "" : "s"}
          </button>
        ) : null}
      </div>

      <ProductGrid
        products={results}
        priorityCount={4}
        emptyState={
          <>
            <p className="jp text-4xl text-ash">無</p>
            <p className="mt-4 font-mono text-xs uppercase tracking-[0.16em] text-steel">
              Nothing in the drop matches that combination
            </p>
            <button
              type="button"
              onClick={() => router.replace("/drop", { scroll: false })}
              className="mt-4 font-mono text-xs uppercase tracking-[0.16em] text-oxide underline underline-offset-4"
            >
              Reset the filters
            </button>
          </>
        }
      />
    </div>
  );
}

function FilterRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span className="label hidden sm:inline">{label}</span>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cx(
        "h-8 border px-3 font-mono text-[0.66rem] uppercase tracking-[0.12em] transition-colors",
        active ? "border-oxide bg-oxide text-bone" : "border-bone/20 text-steel hover:border-bone/50 hover:text-bone",
      )}
    >
      {children}
    </button>
  );
}
