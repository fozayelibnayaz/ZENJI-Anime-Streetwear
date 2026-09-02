"use client";

import { useEffect, useRef, useState } from "react";
import { arcadeInks, arcadeStickers, tagWall } from "@/content/arcade";
import { useCred } from "@/lib/cred";
import { useUI } from "@/providers/UIProvider";
import { cx } from "@/lib/cx";

type Tool = "spray" | "stamp";

/**
 * THE WALL — the studio's unpaintable wall.
 * Hold to spray (jittered particle dots), tap with a stencil loaded to stamp
 * it, export your wall as a PNG. Session-only: like a real wall, it lives
 * until someone paints over it.
 */
export function TagWall() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [tool, setTool] = useState<Tool>("spray");
  const [ink, setInk] = useState<string>(arcadeInks[0].value);
  const [stencil, setStencil] = useState<string>(arcadeStickers[0]);
  const { earn } = useCred();
  const { toast } = useUI();

  // brick backdrop
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.fillStyle = "#141417";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "rgba(242,242,240,0.07)";
    ctx.lineWidth = 2;
    const bw = 64;
    const bh = 26;
    for (let row = 0; row * bh < canvas.height; row++) {
      const offset = row % 2 === 0 ? 0 : bw / 2;
      for (let col = -1; col * bw < canvas.width + bw; col++) {
        ctx.strokeRect(col * bw + offset, row * bh, bw, bh);
      }
    }
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    for (let i = 0; i < 220; i++) {
      ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 2, 2);
    }
  }, []);

  const pos = (event: React.PointerEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * canvas.width,
      y: ((event.clientY - rect.top) / rect.height) * canvas.height,
    };
  };

  const spray = (x: number, y: number) => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = ink;
    for (let i = 0; i < 26; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 16;
      ctx.globalAlpha = 0.12 + Math.random() * 0.3;
      ctx.beginPath();
      ctx.arc(x + Math.cos(angle) * radius, y + Math.sin(angle) * radius, 0.8 + Math.random() * 1.6, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  };

  const stamp = (x: number, y: number) => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((Math.random() - 0.5) * 0.5);
    ctx.strokeStyle = ink;
    ctx.lineWidth = 5;
    const isKanji = /\p{Script=Han}/u.test(stencil);
    if (isKanji) {
      ctx.strokeRect(-44, -44, 88, 88);
      ctx.fillStyle = ink;
      ctx.font = "64px serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(stencil, 0, 6);
    } else {
      ctx.fillStyle = ink;
      ctx.font = "900 56px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(stencil, 0, 0);
    }
    ctx.restore();
    earn("tagged the wall", 5);
  };

  const onDown = (event: React.PointerEvent) => {
    drawing.current = true;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    const { x, y } = pos(event);
    if (tool === "stamp") stamp(x, y);
    else spray(x, y);
  };
  const onMove = (event: React.PointerEvent) => {
    if (!drawing.current || tool !== "spray") return;
    const { x, y } = pos(event);
    spray(x, y);
  };
  const onUp = () => {
    drawing.current = false;
  };

  const exportWall = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "zenji-wall.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
    earn("exported the wall", 10);
    toast("Wall exported");
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#141417";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "rgba(242,242,240,0.07)";
    for (let row = 0; row * 26 < canvas.height; row++) {
      const offset = row % 2 === 0 ? 0 : 32;
      for (let col = -1; col * 64 < canvas.width + 64; col++) {
        ctx.strokeRect(col * 64 + offset, row * 26, 64, 26);
      }
    }
  };

  const chip = "border border-bone/20 px-2.5 py-1.5 font-mono text-[0.62rem] uppercase tracking-[0.12em] text-fog transition-colors hover:border-bone/60 hover:text-bone";

  return (
    <div>
      <p className="label">{tagWall.title}</p>
      <p className="mt-2 max-w-xl text-xs leading-relaxed text-steel">{tagWall.brief}</p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button type="button" aria-pressed={tool === "spray"} onClick={() => setTool("spray")} className={cx(chip, tool === "spray" && "border-oxide text-oxide")}>
          ✦ Spray
        </button>
        <button type="button" aria-pressed={tool === "stamp"} onClick={() => setTool("stamp")} className={cx(chip, tool === "stamp" && "border-oxide text-oxide")}>
          ▣ Stencil
        </button>
        <span className="mx-1 h-5 w-px bg-bone/15" aria-hidden />
        {arcadeInks.map((option) => (
          <button
            key={option.id}
            type="button"
            title={option.label}
            aria-pressed={ink === option.value}
            onClick={() => setInk(option.value)}
            className={cx("h-7 w-7 border-2", ink === option.value ? "border-bone" : "border-transparent")}
            style={{ backgroundColor: option.value }}
          >
            <span className="sr-only">{option.label}</span>
          </button>
        ))}
        <span className="mx-1 h-5 w-px bg-bone/15" aria-hidden />
        {arcadeStickers.map((s) => (
          <button key={s} type="button" aria-pressed={stencil === s} onClick={() => { setStencil(s); setTool("stamp"); }} className={cx(chip, "jp text-sm", stencil === s && tool === "stamp" && "border-oxide text-oxide")}>
            {s}
          </button>
        ))}
        <span className="flex-1" />
        <button type="button" onClick={clear} className={chip}>
          Repaint
        </button>
        <button type="button" onClick={exportWall} className="border border-oxide bg-oxide px-3 py-1.5 font-mono text-[0.62rem] uppercase tracking-[0.12em] text-bone hover:opacity-90">
          ⬇ PNG
        </button>
      </div>

      <canvas
        ref={canvasRef}
        width={1000}
        height={560}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerLeave={onUp}
        className="mt-3 w-full touch-none border border-bone/12"
        style={{ cursor: tool === "spray" ? "crosshair" : "copy" }}
        aria-label="The tag wall — draw with your pointer"
      />
    </div>
  );
}
