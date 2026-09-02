/** Money helpers. Everything internally is AUD cents; formatting happens once, here. */

const formatter = new Intl.NumberFormat("en-AU", {
  style: "currency",
  currency: "AUD",
  currencyDisplay: "narrowSymbol",
});

/** 3999 -> "A$39.99" (the narrow symbol reads "$", so we prefix the country code). */
export function formatPrice(cents: number): string {
  const value = formatter.format(cents / 100);
  return value.startsWith("A$") ? value : `A${value}`;
}

/** Discount as a whole percentage, e.g. 3999 -> 3399 = 15. */
export function discountPercent(price: number, compareAt?: number): number | null {
  if (!compareAt || compareAt <= price) return null;
  return Math.round(((compareAt - price) / compareAt) * 100);
}

export function centsToDollars(cents: number): number {
  return Math.round(cents) / 100;
}
