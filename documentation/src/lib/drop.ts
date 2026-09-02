/**
 * Drop scheduling.
 *
 * ZENJI drops fortnightly, Friday 7:00pm Melbourne time. Rather than hardcode a
 * date that goes stale (and leaves a demo site counting down to the past), the
 * next drop is computed from an anchor plus a fixed interval, so the countdown
 * is always live no matter when the page is opened.
 */

const FORTNIGHT_MS = 14 * 24 * 60 * 60 * 1000;

/** Friday 4 September 2026, 19:00 AEST (UTC+10). */
const ANCHOR_UTC = Date.UTC(2026, 8, 4, 9, 0, 0);

export const MELBOURNE_TZ = "Australia/Melbourne";

export function nextDropAt(now: Date = new Date()): Date {
  const elapsed = now.getTime() - ANCHOR_UTC;
  if (elapsed < 0) return new Date(ANCHOR_UTC);
  const cycles = Math.floor(elapsed / FORTNIGHT_MS) + 1;
  return new Date(ANCHOR_UTC + cycles * FORTNIGHT_MS);
}

export interface Countdown {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

export function countdownTo(target: Date, now: Date = new Date()): Countdown {
  const total = Math.max(0, target.getTime() - now.getTime());
  return {
    days: Math.floor(total / 86_400_000),
    hours: Math.floor(total / 3_600_000) % 24,
    minutes: Math.floor(total / 60_000) % 60,
    seconds: Math.floor(total / 1000) % 60,
    total,
  };
}

export function pad(value: number): string {
  return value.toString().padStart(2, "0");
}

/** "Fri 4 Sep, 7:00 pm" in a given timezone; falls back gracefully if the
 *  runtime has no ICU data for it. */
export function formatInZone(date: Date, timeZone: string): string {
  try {
    return new Intl.DateTimeFormat("en-AU", {
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "numeric",
      minute: "2-digit",
      timeZone,
    }).format(date);
  } catch {
    return date.toUTCString();
  }
}

/** The visitor's own timezone, e.g. "Australia/Perth" — used to translate the
 *  drop time so nobody has to do AEST maths in their head. */
export function resolveLocalTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

/** "Australia/Melbourne" -> "Melbourne" */
export function cityFromTimeZone(timeZone: string): string {
  const city = timeZone.split("/").pop() ?? timeZone;
  return city.replace(/_/g, " ");
}
