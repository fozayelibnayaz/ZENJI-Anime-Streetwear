import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cx } from "@/lib/cx";

type Variant = "solid" | "outline" | "ghost";
type Size = "sm" | "md";

const base =
  "group relative inline-flex items-center justify-center gap-2 font-mono text-xs uppercase tracking-[0.18em] transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-40";

const variants: Record<Variant, string> = {
  solid: "bg-oxide text-bone hover:bg-oxide-deep",
  outline: "border border-bone/25 text-bone hover:border-oxide hover:text-oxide",
  ghost: "text-steel hover:text-bone",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4",
  md: "h-12 px-6",
};

function classes(variant: Variant, size: Size, className?: string) {
  return cx(base, variants[variant], sizes[size], className);
}

interface ActionProps {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
}

export function Action({
  variant = "solid",
  size = "md",
  className,
  children,
  ...rest
}: ActionProps & ComponentProps<"button">) {
  return (
    <button type="button" className={classes(variant, size, className)} {...rest}>
      {children}
    </button>
  );
}

export function ActionLink({
  variant = "solid",
  size = "md",
  className,
  children,
  ...rest
}: ActionProps & ComponentProps<typeof Link>) {
  return (
    <Link className={classes(variant, size, className)} {...rest}>
      {children}
    </Link>
  );
}
