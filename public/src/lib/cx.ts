/** Tiny class-name joiner. A whole dependency for this would be silly. */
export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
