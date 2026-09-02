"use client";

import type { CSSProperties, ElementType, ReactNode } from "react";
import { useInView } from "@/hooks/useInView";
import { useMounted } from "@/hooks/useMounted";
import { cx } from "@/lib/cx";

interface RevealProps {
  children: ReactNode;
  /** Stagger, in milliseconds. */
  delay?: number;
  /** "slash" cuts in diagonally, "rise" is the quieter lift used for body copy. */
  variant?: "slash" | "rise";
  className?: string;
  as?: ElementType;
}

/**
 * The house entrance animation.
 *
 * Nothing is hidden in the server HTML — the element only becomes transparent
 * once JavaScript has mounted, so crawlers and no-JS visitors always see the
 * content, and the observer fires in the first frame for anything above the fold.
 */
export function Reveal({ children, delay = 0, variant = "rise", className, as }: RevealProps) {
  const Tag = (as ?? "div") as ElementType;
  const mounted = useMounted();
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.15 });

  const style: CSSProperties = !mounted
    ? {}
    : inView
      ? {
          animation: `${variant === "slash" ? "zenji-slash-in" : "zenji-rise"} 0.7s var(--ease-slash) both`,
          animationDelay: `${delay}ms`,
        }
      : { opacity: 0 };

  return (
    <Tag ref={ref} className={cx("will-change-[opacity,transform]", className)} style={style}>
      {children}
    </Tag>
  );
}
