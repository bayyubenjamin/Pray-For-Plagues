"use client";

import { useEffect, useRef } from "react";
import { RARITY_SPECS } from "@/lib/protocol";
import {
  LAYER_URLS,
  RARITY_GLOW_COLORS,
  cracksAlpha,
  glowStrength,
  murkAlpha,
  type VialStats,
} from "@/lib/vial-layers";
import type { Rarity } from "@/lib/types";

const CW = 320;
const CH = 480;

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

/**
 * A vial rendered live from its layers: rarity base + murk + cracks +
 * tinted glow, composited on a canvas at the given stats. If an overlay
 * fails to load, that layer is skipped — the base image still renders.
 * One overlay set serves every rarity; only the glow colour differs.
 */
export default function VialPreview({
  rarity,
  stats,
  className,
  label,
}: {
  rarity: Rarity;
  stats: VialStats;
  className?: string;
  label?: string;
}) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const spec = RARITY_SPECS.find((s) => s.rarity === rarity)!;

  useEffect(() => {
    let cancelled = false;
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    Promise.all([
      loadImage(spec.image),
      loadImage(LAYER_URLS.murk),
      loadImage(LAYER_URLS.cracks),
      loadImage(LAYER_URLS.glow),
    ]).then(([base, murk, cracks, glow]) => {
      if (cancelled || !base) return;
      ctx.clearRect(0, 0, CW, CH);
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
      ctx.drawImage(base, 0, 0, CW, CH);
      if (murk) {
        ctx.globalAlpha = murkAlpha(stats.purity);
        ctx.drawImage(murk, 0, 0, CW, CH);
        ctx.globalAlpha = 1;
      }
      if (cracks) {
        ctx.globalAlpha = cracksAlpha(stats.stability);
        ctx.drawImage(cracks, 0, 0, CW, CH);
        ctx.globalAlpha = 1;
      }
      if (glow) {
        const strength = glowStrength(stats.potency);
        if (strength > 0) {
          const tinted = document.createElement("canvas");
          tinted.width = CW;
          tinted.height = CH;
          const tctx = tinted.getContext("2d");
          if (tctx) {
            tctx.fillStyle = RARITY_GLOW_COLORS[rarity];
            tctx.fillRect(0, 0, CW, CH);
            tctx.globalCompositeOperation = "destination-in";
            tctx.drawImage(glow, 0, 0, CW, CH);
            ctx.globalCompositeOperation = "screen";
            ctx.globalAlpha = strength;
            ctx.drawImage(tinted, 0, 0);
            ctx.globalAlpha = 1;
            ctx.globalCompositeOperation = "source-over";
          }
        }
      }
    });
    return () => {
      cancelled = true;
    };
  }, [rarity, spec.image, stats.purity, stats.stability, stats.potency]);

  return (
    <canvas
      ref={ref}
      width={CW}
      height={CH}
      role="img"
      aria-label={label ?? `${rarity} vial`}
      className={className}
    />
  );
}
