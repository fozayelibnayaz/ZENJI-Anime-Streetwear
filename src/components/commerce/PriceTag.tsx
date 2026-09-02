import { discountPercent, formatPrice } from "@/lib/money";
import { cx } from "@/lib/cx";

interface PriceTagProps {
  price: number;
  compareAt?: number;
  className?: string;
  size?: "sm" | "lg";
}

export function PriceTag({ price, compareAt, className, size = "sm" }: PriceTagProps) {
  const off = discountPercent(price, compareAt);

  return (
    <span className={cx("inline-flex items-baseline gap-2 font-mono", size === "lg" ? "text-base" : "text-xs", className)}>
      <span className={off ? "text-oxide" : "text-bone"}>{formatPrice(price)}</span>
      {off && compareAt ? (
        <>
          <span className="text-steel line-through">{formatPrice(compareAt)}</span>
          <span className="sr-only">{off}% off</span>
        </>
      ) : null}
    </span>
  );
}
