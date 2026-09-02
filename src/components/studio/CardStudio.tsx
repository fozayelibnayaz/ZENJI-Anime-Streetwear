"use client";

import { useRef, useState } from "react";
import { products } from "@/content/products";
import { withBasePath } from "@/lib/asset";
import { cx } from "@/lib/cx";
import { useCred } from "@/lib/cred";
import { useUI } from "@/providers/UIProvider";

/**
 * CARD STUDIO — the lookbook director mode.
 *
 * A 4:5 stage with four draggable layers (backdrop, garment, seal, caption).
 * Export rasterises the exact stage to a 1080×1350 canvas — same-origin assets
 * only, so the canvas never taints and the PNG always downloads.
 */

const BACKDROPS = [
  { id: "fitzroy", label: "Fitzroy dawn", src: "/media/lookbook/look-01.webp" },
  { id: "tram", label: "Tram stop 12", src: "/media/lookbook/look-02.webp" },
  { id: "chinatown", label: "Chinatown night", src: "/media/lookbook/look-03.webp" },
];

const STAMPS = ["禅", "力", "炎", "鬼", "浪"];
const CAPTIONS = ["WEAR YOUR STORY", "NAARM / MELBOURNE", "STILL BECOMING", "NO BOOTLEGS"];

type LayerId = "garment" | "stamp" | "caption";

interface LayerState {
  x: number; // % of stage width
  y: number; // % of stage height
}

export function CardStudio() {
  const { earn } = useCred();
  const { toast } = useUI();
  const [backdrop, setBackdrop] = useState(BACKDROPS[0]);
  const [slug, setSlug] = useState(products[0].slug);
  const [stamp, setStamp] = useState(STAMPS[0]);
  const [caption, setCaption] = useState(CAPTIONS[0]);
  const [scale, setScale] = useState(0.62);
  const [rot, setRot] = useState(-4);
  const [layers, setLayers] = useState<Record<LayerId, LayerState>>({
    garment: { x: 50, y: 54 },
    stamp: { x: 84, y: 12 },
    caption: { x: 7, y: 90 },
  });
  const [exporting, setExporting] = useState(false);
  const drag = useRef<LayerId | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  const product = products.find((p) => p.slug === slug) ?? products[0];

  const onMove = (event: React.PointerEvent) => {
    if (!drag.current || !stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const x = Math.min(96, Math.max(4, ((event.clientX - rect.left) / rect.width) * 100));
    const y = Math.min(97, Math.max(3, ((event.clientY - rect.top) / rect.height) * 100));
    setLayers((current) => ({ ...current, [drag.current as LayerId]: { x, y } }));
  };

  const beginDrag = (id: LayerId, event: React.PointerEvent) => {
    drag.current = id;
    (event.currentTarget as HTMLElement).setPointerCapture?.(event.pointerId);
  };

  const randomize = () => {
    setBackdrop(BACKDROPS[Math.floor(Math.random() * BACKDROPS.length)]);
    setSlug(products[Math.floor(Math.random() * products.length)].slug);
    setStamp(STAMPS[Math.floor(Math.random() * STAMPS.length)]);
    setCaption(CAPTIONS[Math.floor(Math.random() * CAPTIONS.length)]);
    setScale(0.5 + Math.random() * 0.3);
    setRot(-8 + Math.random() * 16);
  };

  const exportCard = async () => {
    setExporting(true);
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 1080;
      canvas.height = 1350;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const load = (src: string) =>
        new Promise<HTMLImageElement>((resolve, reject) => {
          const image = new Image();
          image.onload = () => resolve(image);
          image.onerror = reject;
          image.src = src;
        });

      const [bg, garment] = await Promise.all([
        load(withBasePath(backdrop.src)),
        load(withBasePath(product.images.front)),
      ]);

      // backdrop: cover
      const coverScale = Math.max(canvas.width / bg.width, canvas.height / bg.height);
      ctx.drawImage(
        bg,
        (canvas.width - bg.width * coverScale) / 2,
        (canvas.height - bg.height * coverScale) / 2,
        bg.width * coverScale,
        bg.height * coverScale,
      );
      ctx.fillStyle = "rgba(10,10,11,0.38)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // garment
      const gw = canvas.width * scale;
      const gh = gw * (garment.height / garment.width);
      ctx.save();
      ctx.translate((layers.garment.x / 100) * canvas.width, (layers.garment.y / 100) * canvas.height);
      ctx.rotate((rot * Math.PI) / 180);
      ctx.shadowColor = "rgba(0,0,0,0.55)";
      ctx.shadowBlur = 42;
      ctx.drawImage(garment, -gw / 2, -gh / 2, gw, gh);
      ctx.restore();

      // seal stamp
      ctx.save();
      ctx.translate((layers.stamp.x / 100) * canvas.width, (layers.stamp.y / 100) * canvas.height);
      ctx.rotate(0.06);
      ctx.strokeStyle = "#e23a2e";
      ctx.lineWidth = 10;
      ctx.strokeRect(-70, -70, 140, 140);
      ctx.fillStyle = "#e23a2e";
      ctx.font = "110px serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(stamp, 0, 8);
      ctx.restore();

      // caption
      ctx.save();
      ctx.translate((layers.caption.x / 100) * canvas.width, (layers.caption.y / 100) * canvas.height);
      ctx.fillStyle = "#f2f2f0";
      ctx.font = "900 64px system-ui, sans-serif";
      ctx.fillText(caption.toUpperCase(), 0, 0);
      ctx.font = "28px monospace";
      ctx.fillStyle = "rgba(242,242,240,0.75)";
      ctx.fillText(`ZENJI // ${product.romaji.toUpperCase()} · ${product.kanji}`, 0, 48);
      ctx.restore();

      const link = document.createElement("a");
      link.download = `zenji-card-${product.slug}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      earn("cut a studio card", 20);
      toast("Card exported — check your downloads");
    } catch {
      toast("Export failed — the images did not load");
    } finally {
      setExporting(false);
    }
  };

  const control = "border border-bone/20 px-2 py-1.5 font-mono text-[0.62rem] uppercase tracking-[0.12em] text-fog transition-colors hover:border-oxide hover:text-bone";

  return (
    <div className="grid gap-8 lg:grid-cols-[1.15fr_1fr]">
      {/* stage */}
      <div
        ref={stageRef}
        onPointerMove={onMove}
        onPointerUp={() => {
          drag.current = null;
        }}
        className="relative aspect-[4/5] touch-none select-none overflow-hidden border border-bone/12"
        aria-label="Card stage — drag the piece, seal and caption"
      >
        <img src={withBasePath(backdrop.src)} alt="" className="absolute inset-0 h-full w-full object-cover" draggable={false} />
        <div className="absolute inset-0 bg-sumi/35" />

        <img
          src={withBasePath(product.images.front)}
          alt={product.name}
          draggable={false}
          onPointerDown={(event) => beginDrag("garment", event)}
          className="absolute cursor-grab touch-none object-contain active:cursor-grabbing"
          style={{
            left: `${layers.garment.x}%`,
            top: `${layers.garment.y}%`,
            width: `${scale * 100}%`,
            transform: `translate(-50%, -50%) rotate(${rot}deg)`,
            filter: "drop-shadow(0 24px 30px rgba(0,0,0,0.5))",
          }}
        />

        <span
          onPointerDown={(event) => beginDrag("stamp", event)}
          className="jp absolute grid h-16 w-16 cursor-grab place-items-center border-4 border-oxide text-4xl text-oxide active:cursor-grabbing"
          style={{ left: `${layers.stamp.x}%`, top: `${layers.stamp.y}%`, transform: "translate(-50%, -50%) rotate(4deg)" }}
          aria-label="Seal stamp — drag to move"
        >
          {stamp}
        </span>

        <p
          onPointerDown={(event) => beginDrag("caption", event)}
          className="display absolute cursor-grab text-xl tracking-[0.14em] text-bone active:cursor-grabbing sm:text-2xl"
          style={{ left: `${layers.caption.x}%`, top: `${layers.caption.y}%`, transform: "translateY(-50%)" }}
          aria-label="Caption — drag to move"
        >
          {caption.toUpperCase()}
          <span className="mt-1 block font-mono text-[0.6rem] tracking-[0.18em] text-bone/70">
            ZENJI // {product.romaji.toUpperCase()} · {product.kanji}
          </span>
        </p>
      </div>

      {/* controls */}
      <div className="space-y-6 border border-bone/12 bg-ink p-5">
        <div>
          <p className="label">01 — backdrop</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {BACKDROPS.map((option) => (
              <button key={option.id} type="button" aria-pressed={backdrop.id === option.id} onClick={() => setBackdrop(option)} className={cx(control, backdrop.id === option.id && "border-oxide text-oxide")}>
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="label">02 — the piece</p>
          <div className="mt-3 grid max-h-44 grid-cols-3 gap-2 overflow-y-auto pr-1 sm:grid-cols-4">
            {products.map((p) => (
              <button
                key={p.slug}
                type="button"
                aria-pressed={p.slug === slug}
                onClick={() => setSlug(p.slug)}
                className={cx("border p-1 transition-colors", p.slug === slug ? "border-oxide" : "border-bone/10 hover:border-bone/40")}
              >
                <img src={withBasePath(p.images.front)} alt={p.name} className="aspect-[4/5] w-full object-cover" loading="lazy" />
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <p className="label">03 — seal</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {STAMPS.map((s) => (
                <button key={s} type="button" aria-pressed={stamp === s} onClick={() => setStamp(s)} className={cx(control, "jp text-base", stamp === s && "border-oxide text-oxide")}>
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="label">04 — caption</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {CAPTIONS.map((c) => (
                <button key={c} type="button" aria-pressed={caption === c} onClick={() => setCaption(c)} className={cx(control, caption === c && "border-oxide text-oxide")}>
                  {c}
                </button>
              ))}
            </div>
            <input
              value={caption}
              onChange={(event) => setCaption(event.target.value.slice(0, 28))}
              placeholder="Or type your own"
              className="mt-2 w-full border border-bone/20 bg-sumi px-3 py-2 font-mono text-xs text-bone outline-none focus:border-oxide"
              aria-label="Custom caption"
            />
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <label className="block">
            <p className="label">size in frame · {Math.round(scale * 100)}%</p>
            <input type="range" min={30} max={95} value={Math.round(scale * 100)} onChange={(event) => setScale(Number(event.target.value) / 100)} className="mt-3 w-full accent-[#e23a2e]" />
          </label>
          <label className="block">
            <p className="label">tilt · {rot}°</p>
            <input type="range" min={-20} max={20} value={rot} onChange={(event) => setRot(Number(event.target.value))} className="mt-3 w-full accent-[#e23a2e]" />
          </label>
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            type="button"
            onClick={exportCard}
            disabled={exporting}
            className="h-12 flex-1 border border-oxide bg-oxide px-5 font-mono text-[0.7rem] uppercase tracking-[0.18em] text-bone transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {exporting ? "Cutting…" : "⬇ Export PNG card"}
          </button>
          <button type="button" onClick={randomize} className="h-12 border border-bone/20 px-5 font-mono text-[0.7rem] uppercase tracking-[0.18em] text-fog hover:border-bone/60 hover:text-bone">
            ⚄ Randomize
          </button>
        </div>
        <p className="text-[0.68rem] leading-relaxed text-steel">
          Drag the piece, the seal and the caption straight on the stage. Export renders a 1080×1350 PNG on your
          device — nothing is uploaded anywhere.
        </p>
      </div>
    </div>
  );
}
