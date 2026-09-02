import { describe, expect, it } from "vitest";
import { centsToDollars, discountPercent, formatPrice } from "@/lib/money";
import { countdownTo, formatInZone, nextDropAt, pad, cityFromTimeZone, MELBOURNE_TZ } from "@/lib/drop";

describe("money", () => {
  it("formats AUD the way an Australian expects to see it", () => {
    expect(formatPrice(3999)).toBe("A$39.99");
    expect(formatPrice(10999)).toBe("A$109.99");
    expect(formatPrice(0)).toBe("A$0.00");
  });

  it("rounds discounts to whole percentages", () => {
    expect(discountPercent(3399, 3999)).toBe(15);
    expect(discountPercent(3999)).toBeNull();
    // A "sale" price that is not lower is not a sale.
    expect(discountPercent(3999, 3999)).toBeNull();
    expect(discountPercent(3999, 3000)).toBeNull();
  });

  it("converts cents to dollars without floating point drift", () => {
    expect(centsToDollars(3399)).toBe(33.99);
    expect(centsToDollars(10999)).toBe(109.99);
  });
});

describe("drop schedule", () => {
  it("always returns a drop in the future", () => {
    for (const iso of ["2024-01-01T00:00:00Z", "2026-09-04T08:59:00Z", "2030-05-05T12:00:00Z"]) {
      const now = new Date(iso);
      expect(nextDropAt(now).getTime()).toBeGreaterThan(now.getTime());
    }
  });

  it("keeps drops exactly a fortnight apart", () => {
    const first = nextDropAt(new Date("2026-09-05T00:00:00Z"));
    const second = nextDropAt(new Date(first.getTime() + 1000));
    expect(second.getTime() - first.getTime()).toBe(14 * 24 * 60 * 60 * 1000);
  });

  it("lands on a Friday evening in Melbourne", () => {
    const label = formatInZone(nextDropAt(new Date("2026-09-05T00:00:00Z")), MELBOURNE_TZ);
    expect(label).toMatch(/Fri/);
    expect(label).toMatch(/7:00/);
  });

  it("breaks the remaining time into parts that add back up", () => {
    const now = new Date("2026-09-01T00:00:00Z");
    const target = new Date("2026-09-03T04:05:06Z");
    const left = countdownTo(target, now);

    expect(left.days).toBe(2);
    expect(left.hours).toBe(4);
    expect(left.minutes).toBe(5);
    expect(left.seconds).toBe(6);
    expect(left.total).toBe(target.getTime() - now.getTime());
  });

  it("clamps to zero once the drop has landed", () => {
    const left = countdownTo(new Date("2026-01-01T00:00:00Z"), new Date("2026-02-01T00:00:00Z"));
    expect(left.total).toBe(0);
    expect(left.days).toBe(0);
  });

  it("pads and labels for display", () => {
    expect(pad(7)).toBe("07");
    expect(pad(70)).toBe("70");
    expect(cityFromTimeZone("Australia/Broken_Hill")).toBe("Broken Hill");
    expect(cityFromTimeZone("UTC")).toBe("UTC");
  });
});
