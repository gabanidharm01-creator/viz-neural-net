import { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Interactive 3D stack of U-Net stages. Hovering a slab lifts it out of the
 * stack and explains the stage in plain language. Decorative + didactic.
 */
const LAYERS: { label: string; plain: string; tone: string; size: number }[] = [
  { label: "Input 128²", plain: "The raw scan comes in.", tone: "var(--primary)", size: 100 },
  { label: "Encoder 64²", plain: "Shrink it, learn edges.", tone: "var(--encoder)", size: 84 },
  { label: "Encoder 32²", plain: "Shrink again, learn shapes.", tone: "var(--encoder)", size: 68 },
  { label: "Bottleneck 16²", plain: "The smallest, smartest view.", tone: "var(--bottleneck)", size: 54 },
  { label: "Decoder 32²", plain: "Grow back up with skips.", tone: "var(--decoder)", size: 68 },
  { label: "Decoder 64²", plain: "More detail returns.", tone: "var(--decoder)", size: 84 },
  { label: "Mask 128²", plain: "One colour per pixel.", tone: "var(--skip)", size: 100 },
];

export function LayerStack3D() {
  const [active, setActive] = useState<number | null>(null);

  return (
    <div className="flex flex-col gap-3">
      <div
        className="grid place-items-center"
        style={{ perspective: "1100px", height: 300 }}
        aria-hidden
      >
        <div
          className="relative"
          style={{ transformStyle: "preserve-3d", transform: "rotateX(58deg) rotateZ(-32deg)" }}
        >
          {LAYERS.map((l, i) => {
            const lift = (LAYERS.length / 2 - i) * 26 + (active === i ? 34 : 0);
            return (
              <div
                key={l.label}
                onPointerEnter={() => setActive(i)}
                onPointerLeave={() => setActive(null)}
                className={cn(
                  "absolute left-1/2 top-1/2 rounded-md border transition-all duration-300",
                  active === i && "z-10",
                )}
                style={{
                  width: l.size * 1.6,
                  height: l.size * 1.6,
                  marginLeft: -(l.size * 0.8),
                  marginTop: -(l.size * 0.8),
                  transform: `translateZ(${lift}px)`,
                  borderColor: l.tone,
                  background: `color-mix(in oklab, ${l.tone} ${active === i ? 30 : 14}%, transparent)`,
                  boxShadow: `0 0 34px -12px ${l.tone}`,
                }}
              />
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {LAYERS.map((l, i) => (
          <button
            key={l.label}
            type="button"
            onPointerEnter={() => setActive(i)}
            onPointerLeave={() => setActive(null)}
            onFocus={() => setActive(i)}
            onBlur={() => setActive(null)}
            className="rounded-md border border-border px-2 py-1 font-mono text-[10px] transition-colors"
            style={
              active === i
                ? { borderColor: l.tone, color: l.tone, background: `color-mix(in oklab, ${l.tone} 12%, transparent)` }
                : undefined
            }
          >
            {l.label}
          </button>
        ))}
      </div>
      <p className="min-h-5 text-sm text-muted-foreground">
        {active === null ? "Hover a slab to see what that layer does." : LAYERS[active]!.plain}
      </p>
    </div>
  );
}
