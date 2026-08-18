import { MatrixGrid } from "@/components/viz/MatrixGrid";
import type { Matrix } from "@/lib/types";

export function FeatureMapVisualizer({
  title,
  matrix,
  cellSize = 26,
  showValues = false,
}: {
  title: string;
  matrix: Matrix;
  cellSize?: number;
  showValues?: boolean;
}) {
  return (
    <div>
      <p className="mb-2 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
        {title} · {matrix.length}×{matrix[0]?.length ?? 0}
      </p>
      <MatrixGrid matrix={matrix} cellSize={cellSize} showValues={showValues} />
    </div>
  );
}

/** Renders a tensor shape as a labelled chip series, e.g. 128 × 128 × 32. */
export function TensorVisualizer({ label, shape }: { label: string; shape: number[] }) {
  return (
    <div className="rounded-md border border-border bg-secondary/40 px-3 py-2">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="font-mono text-sm text-primary">{shape.join(" × ")}</p>
    </div>
  );
}
