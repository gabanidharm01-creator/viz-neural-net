import { useEffect, useMemo, useRef, useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

const SIZE = 64;

/**
 * Demo volume viewer.
 *
 * The volume below is a clearly-labelled synthetic phantom generated for
 * teaching orthogonal slice navigation. It is NOT model output and NOT a real
 * scan — real volumes and real segmentations come from the backend.
 */
function buildPhantom() {
  const volume = new Float32Array(SIZE ** 3);
  const label = new Uint8Array(SIZE ** 3);
  const c = SIZE / 2;
  for (let z = 0; z < SIZE; z++) {
    for (let y = 0; y < SIZE; y++) {
      for (let x = 0; x < SIZE; x++) {
        const i = z * SIZE * SIZE + y * SIZE + x;
        const head = Math.hypot(x - c, (y - c) * 1.15, (z - c) * 1.1);
        const lesion = Math.hypot(x - c * 1.35, y - c * 0.78, z - c * 1.05);
        let v = 0;
        if (head < 26) v = 0.32 + 0.1 * Math.sin(x * 0.35) * Math.cos(y * 0.31);
        if (head < 22) v = 0.6 + 0.12 * Math.sin((x + y + z) * 0.22);
        if (head > 24 && head < 26.5) v = 0.85;
        if (lesion < 6) {
          v = 0.95;
          label[i] = 1;
        }
        volume[i] = Math.max(0, Math.min(1, v));
      }
    }
  }
  return { volume, label };
}

type Plane = "axial" | "coronal" | "sagittal";

export function VolumeViewer() {
  const { volume, label } = useMemo(buildPhantom, []);
  const [plane, setPlane] = useState<Plane>("axial");
  const [slice, setSlice] = useState(Math.floor(SIZE / 2));
  const [overlay, setOverlay] = useState(true);
  const [opacity, setOpacity] = useState(0.5);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const dragging = useRef<{ x: number; y: number } | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const img = ctx.createImageData(SIZE, SIZE);

    const sample = (a: number, b: number) => {
      let idx: number;
      if (plane === "axial") idx = slice * SIZE * SIZE + b * SIZE + a;
      else if (plane === "coronal") idx = b * SIZE * SIZE + slice * SIZE + a;
      else idx = b * SIZE * SIZE + a * SIZE + slice;
      return { v: volume[idx] ?? 0, l: label[idx] ?? 0 };
    };

    for (let b = 0; b < SIZE; b++) {
      for (let a = 0; a < SIZE; a++) {
        const { v, l } = sample(a, b);
        const g = Math.round(v * 255);
        const o = (b * SIZE + a) * 4;
        let r = g;
        let gr = g;
        let bl = g;
        if (overlay && l) {
          r = Math.round(g * (1 - opacity) + 255 * opacity);
          gr = Math.round(g * (1 - opacity) + 90 * opacity);
          bl = Math.round(g * (1 - opacity) + 140 * opacity);
        }
        img.data[o] = r;
        img.data[o + 1] = gr;
        img.data[o + 2] = bl;
        img.data[o + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
  }, [plane, slice, overlay, opacity, volume, label]);

  return (
    <div className="grid gap-4 lg:grid-cols-[auto_minmax(0,1fr)]">
      <div
        className="relative overflow-hidden rounded-lg border border-border bg-background"
        style={{ width: 340, height: 340 }}
        onPointerDown={(e) => {
          dragging.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          if (!dragging.current) return;
          setPan({ x: e.clientX - dragging.current.x, y: e.clientY - dragging.current.y });
        }}
        onPointerUp={() => {
          dragging.current = null;
        }}
      >
        <canvas
          ref={canvasRef}
          width={SIZE}
          height={SIZE}
          className="absolute left-1/2 top-1/2 origin-center"
          style={{
            imageRendering: "pixelated",
            width: 320,
            height: 320,
            transform: `translate(-50%, -50%) translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          }}
        />
        <Badge variant="outline" className="absolute left-2 top-2 font-mono text-[10px]">
          {plane} · slice {slice}/{SIZE - 1}
        </Badge>
      </div>

      <div className="space-y-4">
        <div className="flex gap-2">
          {(["axial", "coronal", "sagittal"] as Plane[]).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPlane(p)}
              className={`rounded-md border px-3 py-1.5 text-xs capitalize transition-colors ${
                plane === p ? "border-primary bg-primary/15 text-primary" : "border-border bg-card"
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        <div>
          <Label className="text-xs text-muted-foreground">Slice</Label>
          <Slider
            value={[slice]}
            min={0}
            max={SIZE - 1}
            step={1}
            onValueChange={([v]) => setSlice(v ?? 0)}
            className="mt-2"
          />
        </div>

        <div>
          <Label className="text-xs text-muted-foreground">Zoom {zoom.toFixed(1)}×</Label>
          <Slider
            value={[zoom]}
            min={0.5}
            max={4}
            step={0.1}
            onValueChange={([v]) => setZoom(v ?? 1)}
            className="mt-2"
          />
        </div>

        <div className="flex items-center gap-3">
          <Switch id="overlay" checked={overlay} onCheckedChange={setOverlay} />
          <Label htmlFor="overlay" className="text-xs">
            Segmentation overlay
          </Label>
        </div>

        <div>
          <Label className="text-xs text-muted-foreground">
            Overlay opacity {Math.round(opacity * 100)}%
          </Label>
          <Slider
            value={[opacity]}
            min={0}
            max={1}
            step={0.05}
            onValueChange={([v]) => setOpacity(v ?? 0.5)}
            className="mt-2"
          />
        </div>

        <button
          type="button"
          onClick={() => {
            setPan({ x: 0, y: 0 });
            setZoom(1);
          }}
          className="rounded-md border border-border px-3 py-1.5 text-xs hover:border-primary"
        >
          Reset view
        </button>

        <p className="text-xs text-muted-foreground">
          Drag inside the viewport to pan. This 64³ volume is a synthetic teaching phantom, not a
          real scan or a model prediction.
        </p>
      </div>
    </div>
  );
}
