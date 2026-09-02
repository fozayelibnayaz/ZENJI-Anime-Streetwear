import type { Product } from "@/content/products";
import { ProductCard } from "./ProductCard";
import { cx } from "@/lib/cx";

interface ProductGridProps {
  products: Product[];
  /** First N images load eagerly — everything below stays lazy. */
  priorityCount?: number;
  className?: string;
  emptyState?: React.ReactNode;
}

export function ProductGrid({ products, priorityCount = 0, className, emptyState }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="border border-dashed border-bone/15 px-6 py-20 text-center">
        {emptyState ?? (
          <>
            <p className="jp text-4xl text-ash">無</p>
            <p className="mt-4 font-mono text-xs uppercase tracking-[0.16em] text-steel">
              Nothing matches those filters
            </p>
          </>
        )}
      </div>
    );
  }

  return (
    <div className={cx("grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4", className)}>
      {products.map((product, index) => (
        <ProductCard key={product.slug} product={product} index={index} priority={index < priorityCount} />
      ))}
    </div>
  );
}
