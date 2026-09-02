"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Img } from "@/components/ui/Img";
import { useRouter } from "next/navigation";
import { nav } from "@/content/site";
import { queryCatalogue } from "@/lib/catalogue";
import { formatPrice } from "@/lib/money";
import { cx } from "@/lib/cx";
import { usePreferences } from "@/providers/PreferencesProvider";
import { useUI } from "@/providers/UIProvider";

interface Command {
  id: string;
  group: "Products" | "Pages" | "Controls";
  label: string;
  hint?: string;
  thumb?: string;
  keywords: string;
  run: () => void;
}

/**
 * SYSTEM console — one input that searches the catalogue, jumps between pages
 * and flips site settings. Opens with ⌘K / Ctrl+K, with "/" as a shortcut, or
 * the search button in the header on touch devices.
 *
 * This outer component only owns the shortcut; the panel below is mounted fresh
 * each time it opens, so the query and cursor start clean without any resetting.
 */
export function CommandConsole() {
  const { overlay, openOverlay, closeOverlay } = useUI();
  const open = overlay === "console";

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing = target?.matches?.("input, textarea, select, [contenteditable='true']");

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        if (open) closeOverlay();
        else openOverlay("console");
        return;
      }
      if (event.key === "/" && !typing && !open) {
        event.preventDefault();
        openOverlay("console");
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, openOverlay, closeOverlay]);

  if (!open) return null;
  return <ConsolePanel onClose={closeOverlay} />;
}

function ConsolePanel({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const { openOverlay, toast } = useUI();
  const { motion, toggleMotion, unit, setUnit, fit } = usePreferences();

  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);

  const commands = useMemo<Command[]>(() => {
    const productCommands: Command[] = queryCatalogue({ search: query, sort: "featured" })
      .slice(0, 6)
      .map((product) => ({
        id: `product-${product.slug}`,
        group: "Products",
        label: product.name,
        hint: `${formatPrice(product.price)} · ${product.colourway}`,
        thumb: product.images.front,
        keywords: `${product.name} ${product.romaji} ${product.colourway} ${product.category}`,
        run: () => router.push(`/drop/${product.slug}`),
      }));

    const pageCommands: Command[] = nav.map((item) => ({
      id: `page-${item.href}`,
      group: "Pages",
      label: item.label,
      hint: item.note,
      keywords: `${item.label} ${item.note}`,
      run: () => router.push(item.href),
    }));

    const controlCommands: Command[] = [
      {
        id: "control-loadout",
        group: "Controls",
        label: "Open loadout",
        hint: "Review what you have picked",
        keywords: "cart bag loadout checkout",
        run: () => openOverlay("loadout"),
      },
      {
        id: "control-size-guide",
        group: "Controls",
        label: "Open size guide",
        hint: "Flat measurements for every size",
        keywords: "size guide measurements chart",
        run: () => openOverlay("size-guide"),
      },
      {
        id: "control-fit",
        group: "Controls",
        label: fit ? `Recalculate my fit (currently ${fit.size})` : "Find my size",
        hint: "Fit Lab",
        keywords: "fit size lab measure",
        run: () => router.push("/fit-lab"),
      },
      {
        id: "control-motion",
        group: "Controls",
        label: motion === "off" ? "Turn animation back on" : "Reduce animation",
        hint: "Site-wide motion setting",
        keywords: "motion animation reduce accessibility",
        run: () => {
          toggleMotion();
          toast(motion === "off" ? "Animation on" : "Animation reduced");
        },
      },
      {
        id: "control-units",
        group: "Controls",
        label: unit === "cm" ? "Show sizes in inches" : "Show sizes in centimetres",
        hint: "Measurement units",
        keywords: "units inches cm centimetres",
        run: () => {
          setUnit(unit === "cm" ? "in" : "cm");
          toast(unit === "cm" ? "Measurements in inches" : "Measurements in centimetres");
        },
      },
    ];

    const term = query.trim().toLowerCase();
    const matches = (command: Command) => !term || `${command.label} ${command.keywords}`.toLowerCase().includes(term);

    return [...productCommands, ...pageCommands.filter(matches), ...controlCommands.filter(matches)];
  }, [query, router, openOverlay, motion, toggleMotion, unit, setUnit, toast, fit]);

  // Focus after the panel has painted, otherwise iOS refuses to raise the keyboard.
  useEffect(() => {
    const id = window.setTimeout(() => inputRef.current?.focus(), 30);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    listRef.current?.querySelector('[data-active="true"]')?.scrollIntoView({ block: "nearest" });
  }, [cursor]);

  const runAt = (index: number) => {
    const command = commands[index];
    if (!command) return;
    onClose();
    command.run();
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setCursor((c) => (c + 1) % Math.max(commands.length, 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setCursor((c) => (c - 1 + commands.length) % Math.max(commands.length, 1));
    } else if (event.key === "Enter") {
      event.preventDefault();
      runAt(cursor);
    }
  };

  let lastGroup = "";

  return (
    <div className="fixed inset-0 z-[92]" role="presentation">
      <button
        type="button"
        aria-label="Close command console"
        onClick={onClose}
        className="absolute inset-0 h-full w-full cursor-default bg-sumi/85 backdrop-blur-sm"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command console"
        className="absolute inset-x-0 top-[6vh] mx-auto flex max-h-[80dvh] w-[min(40rem,92vw)] flex-col border border-bone/15 bg-ink shadow-panel animate-[zenji-rise_.22s_var(--ease-slash)_both]"
      >
        <div className="flex items-center gap-3 border-b border-bone/10 px-4">
          <span aria-hidden="true" className="font-mono text-xs text-oxide">
            ZENJI&gt;
          </span>
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setCursor(0);
            }}
            onKeyDown={onKeyDown}
            type="text"
            role="combobox"
            aria-expanded="true"
            aria-controls="console-results"
            aria-autocomplete="list"
            aria-activedescendant={commands[cursor]?.id}
            placeholder="Search the drop, jump to a page, change a setting…"
            className="h-14 w-full bg-transparent font-mono text-sm text-bone outline-none placeholder:text-steel/70"
          />
          <kbd className="hidden shrink-0 border border-bone/15 px-2 py-1 font-mono text-[0.6rem] uppercase tracking-widest text-steel sm:block">
            Esc
          </kbd>
        </div>

        <ul id="console-results" ref={listRef} role="listbox" aria-label="Results" className="flex-1 overflow-y-auto py-2">
          {commands.length === 0 ? (
            <li className="px-4 py-8 text-center font-mono text-xs uppercase tracking-[0.16em] text-steel">
              No match for “{query}”
            </li>
          ) : (
            commands.map((command, index) => {
              const showGroup = command.group !== lastGroup;
              lastGroup = command.group;
              const active = index === cursor;

              return (
                <li key={command.id}>
                  {showGroup ? <p className="label px-4 pb-1 pt-3">{command.group}</p> : null}
                  <button
                    type="button"
                    id={command.id}
                    role="option"
                    aria-selected={active}
                    data-active={active}
                    onMouseEnter={() => setCursor(index)}
                    onClick={() => runAt(index)}
                    className={cx(
                      "flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors",
                      active ? "bg-oxide/15" : "hover:bg-bone/5",
                    )}
                  >
                    {command.thumb ? (
                      <span className="relative h-10 w-8 shrink-0 overflow-hidden bg-slate">
                        <Img src={command.thumb} alt="" fill sizes="32px" className="object-cover" />
                      </span>
                    ) : (
                      <span
                        aria-hidden="true"
                        className={cx("w-8 shrink-0 text-center font-mono text-xs", active ? "text-oxide" : "text-steel")}
                      >
                        ▸
                      </span>
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm text-bone">{command.label}</span>
                      {command.hint ? (
                        <span className="block truncate font-mono text-[0.66rem] uppercase tracking-[0.12em] text-steel">
                          {command.hint}
                        </span>
                      ) : null}
                    </span>
                  </button>
                </li>
              );
            })
          )}
        </ul>

        <footer className="hidden items-center gap-4 border-t border-bone/10 px-4 py-2 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-steel sm:flex">
          <span>↑ ↓ navigate</span>
          <span>↵ select</span>
          <span>esc close</span>
        </footer>
      </div>
    </div>
  );
}
