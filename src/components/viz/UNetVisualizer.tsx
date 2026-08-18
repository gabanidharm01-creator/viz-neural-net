import { useMemo, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { PreviewBanner, ErrorBanner } from "@/components/SourceBanner";
import { SkipConnectionVisualizer } from "@/components/viz/SkipConnectionVisualizer";
import { useComputation } from "@/hooks/useComputation";
import { getUnetArchitecture } from "@/lib/api";
import { localUNetArchitecture } from "@/lib/localPreview";
import type { UNetArchitecture, UNetBlock, UNetSkip } from "@/lib/types";
import { useRegisterVizContext } from "@/lib/tutor";

const STAGE_COLOR: Record<UNetBlock["stage"], string> = {
  input: "var(--muted-foreground)",
  encoder: "var(--encoder)",
  downsample: "var(--encoder)",
  bottleneck: "var(--bottleneck)",
  upsample: "var(--decoder)",
  decoder: "var(--decoder)",
  output: "var(--primary)",
};

export function UNetVisualizer({
  inputSize = 128,
  baseFeatures = 32,
  depth = 3,
  numClasses = 2,
  dimensions = 2,
}: {
  inputSize?: number;
  baseFeatures?: number;
  depth?: number;
  numClasses?: number;
  dimensions?: 2 | 3;
}) {
  const { data, loading, error, usingPreview } = useComputation<UNetArchitecture>(
    () =>
      getUnetArchitecture({
        input_size: inputSize,
        base_features: baseFeatures,
        depth,
        num_classes: numClasses,
        dimensions,
      }),
    () => localUNetArchitecture({ inputSize, baseFeatures, depth, numClasses, dimensions }),
    [inputSize, baseFeatures, depth, numClasses, dimensions],
  );

  const [selectedBlock, setSelectedBlock] = useState<UNetBlock | null>(null);
  const [selectedSkip, setSelectedSkip] = useState<UNetSkip | null>(null);

  useRegisterVizContext(
    dimensions === 3 ? "unet-3d" : "unet",
    selectedSkip ? `skip level ${selectedSkip.level}` : (selectedBlock?.label ?? "overview"),
    { inputSize, baseFeatures, depth, numClasses, dimensions },
  );

  const layout = useMemo(() => {
    if (!data) return null;
    const rowH = 78;
    const boxW = 208;
    const boxH = 50;
    const leftX = 40;
    const rightX = 452;
    const positions = new Map<string, { x: number; y: number }>();

    const encoders = data.blocks.filter((b) => b.stage === "encoder");
    const downs = data.blocks.filter((b) => b.stage === "downsample");
    const ups = data.blocks.filter((b) => b.stage === "upsample");
    const decoders = data.blocks.filter((b) => b.stage === "decoder");
    const bottleneck = data.blocks.find((b) => b.stage === "bottleneck");
    const input = data.blocks.find((b) => b.stage === "input");
    const output = data.blocks.find((b) => b.stage === "output");

    let y = 16;
    if (input) positions.set(input.id, { x: leftX, y });
    y += rowH;
    encoders.forEach((enc, i) => {
      positions.set(enc.id, { x: leftX, y: y + i * rowH * 2 });
      const down = downs[i];
      if (down) positions.set(down.id, { x: leftX, y: y + i * rowH * 2 + rowH });
    });
    const bottleY = y + encoders.length * rowH * 2;
    if (bottleneck) positions.set(bottleneck.id, { x: (leftX + rightX) / 2, y: bottleY });

    ups.forEach((up, i) => {
      const level = up.level;
      const rowIndex = depth - 1 - level;
      positions.set(up.id, { x: rightX, y: bottleY - (rowIndex * 2 + 1) * rowH });
      const dec = decoders.find((d) => d.level === level);
      if (dec) positions.set(dec.id, { x: rightX, y: bottleY - (rowIndex * 2 + 2) * rowH });
    });
    if (output) positions.set(output.id, { x: rightX, y: bottleY - (depth * 2 + 1) * rowH });

    const height = bottleY + boxH + 24;
    return { positions, boxW, boxH, width: rightX + boxW + 40, height };
  }, [data, depth]);

  if (loading) return <Skeleton className="h-[520px] w-full" />;
  if (error) return <ErrorBanner title={error.title} detail={error.detail} />;
  if (!data || !layout) return null;

  const center = (id: string) => {
    const p = layout.positions.get(id);
    return p ? { cx: p.x + layout.boxW / 2, cy: p.y + layout.boxH / 2, ...p } : null;
  };

  const flowPairs: [string, string][] = [];
  const ordered = data.blocks.filter((b) => layout.positions.has(b.id));
  for (let i = 0; i < ordered.length - 1; i++) {
    const a = ordered[i]!;
    const b = ordered[i + 1]!;
    flowPairs.push([a.id, b.id]);
  }

  return (
    <div className="space-y-4">
      {usingPreview ? <PreviewBanner what="The U-Net shape schedule" /> : null}
      <div className="flex flex-wrap gap-2 font-mono text-xs">
        <Badge variant="secondary">{data.name}</Badge>
        <Badge variant="secondary">depth {depth}</Badge>
        <Badge variant="secondary">base features {baseFeatures}</Badge>
        <Badge variant="secondary">classes {numClasses}</Badge>
        <Badge variant="outline">source: {data.source}</Badge>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="overflow-x-auto rounded-lg border border-border bg-card/50 p-2">
          <svg
            viewBox={`0 0 ${layout.width} ${layout.height}`}
            width="100%"
            style={{ minWidth: 640 }}
            role="img"
            aria-label="U-Net architecture diagram"
          >
            <defs>
              <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <path d="M0,0 L6,3 L0,6 Z" fill="var(--muted-foreground)" />
              </marker>
              <marker id="arrow-skip" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <path d="M0,0 L6,3 L0,6 Z" fill="var(--skip)" />
              </marker>
            </defs>

            {flowPairs.map(([from, to]) => {
              const a = center(from);
              const b = center(to);
              if (!a || !b) return null;
              return (
                <path
                  key={`${from}-${to}`}
                  d={`M ${a.cx} ${a.cy} L ${b.cx} ${b.cy}`}
                  stroke="var(--muted-foreground)"
                  strokeWidth={1.5}
                  fill="none"
                  className="flow-dash"
                  markerEnd="url(#arrow)"
                  opacity={0.55}
                />
              );
            })}

            {data.skips.map((skip) => {
              const a = center(skip.from);
              const b = center(skip.to);
              if (!a || !b) return null;
              const selected = selectedSkip?.id === skip.id;
              return (
                <g
                  key={skip.id}
                  onClick={() => {
                    setSelectedSkip(skip);
                    setSelectedBlock(null);
                  }}
                  className="cursor-pointer"
                >
                  <path
                    d={`M ${a.x + layout.boxW} ${a.cy} C ${a.x + layout.boxW + 90} ${a.cy - 30}, ${b.x - 90} ${b.cy - 30}, ${b.x} ${b.cy}`}
                    stroke="var(--skip)"
                    strokeWidth={selected ? 3 : 1.8}
                    fill="none"
                    className="flow-dash"
                    markerEnd="url(#arrow-skip)"
                  />
                  <text
                    x={(a.x + layout.boxW + b.x) / 2}
                    y={Math.min(a.cy, b.cy) - 16}
                    textAnchor="middle"
                    fontSize="10"
                    fill="var(--skip)"
                    className="font-mono"
                  >
                    skip · concat {skip.concatenated_shape.join("×")}
                  </text>
                </g>
              );
            })}

            {data.blocks.map((block) => {
              const p = layout.positions.get(block.id);
              if (!p) return null;
              const selected = selectedBlock?.id === block.id;
              return (
                <g
                  key={block.id}
                  onClick={() => {
                    setSelectedBlock(block);
                    setSelectedSkip(null);
                  }}
                  className="cursor-pointer"
                >
                  <rect
                    x={p.x}
                    y={p.y}
                    width={layout.boxW}
                    height={layout.boxH}
                    rx={8}
                    fill="var(--card)"
                    stroke={STAGE_COLOR[block.stage]}
                    strokeWidth={selected ? 2.5 : 1.4}
                  />
                  <text x={p.x + 12} y={p.y + 21} fontSize="12" fill="var(--foreground)">
                    {block.label}
                  </text>
                  <text
                    x={p.x + 12}
                    y={p.y + 38}
                    fontSize="11"
                    fill={STAGE_COLOR[block.stage]}
                    className="font-mono"
                  >
                    {block.shape.join("×")}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        <div className="space-y-3">
          {selectedSkip ? (
            <SkipConnectionVisualizer skip={selectedSkip} />
          ) : selectedBlock ? (
            <div className="panel p-4">
              <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                {selectedBlock.stage}
              </p>
              <h3 className="mt-1 text-sm font-semibold">{selectedBlock.label}</h3>
              <p className="mt-1 font-mono text-xs text-primary">
                tensor: {selectedBlock.shape.join("×")}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">{selectedBlock.description}</p>
            </div>
          ) : (
            <div className="panel p-4 text-sm text-muted-foreground">
              Click any block to inspect its tensor shape, or click a gold skip connection to see
              how encoder and decoder features are concatenated.
            </div>
          )}

          <div className="panel p-4">
            <p className="mb-2 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
              Tensor shape schedule
            </p>
            <ul className="space-y-1 font-mono text-xs">
              {data.blocks.map((b) => (
                <li key={b.id} className="flex justify-between gap-3">
                  <span className="text-muted-foreground">{b.label}</span>
                  <span style={{ color: STAGE_COLOR[b.stage] }}>{b.shape.join("×")}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
