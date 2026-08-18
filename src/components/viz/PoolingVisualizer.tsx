import { MatrixGrid, type CellState } from "@/components/viz/MatrixGrid";
import { AnimationControls } from "@/components/AnimationControls";
import { PreviewBanner, ErrorBanner } from "@/components/SourceBanner";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useAnimationEngine } from "@/hooks/useAnimationEngine";
import { useComputation } from "@/hooks/useComputation";
import { calculatePooling } from "@/lib/api";
import { localMaxPooling } from "@/lib/localPreview";
import type { Matrix, PoolingResult } from "@/lib/types";
import { useRegisterVizContext } from "@/lib/tutor";

export function PoolingVisualizer({
  input,
  window = [2, 2],
  stride = 2,
  moduleId = "pooling",
}: {
  input: Matrix;
  window?: [number, number];
  stride?: number;
  moduleId?: string;
}) {
  const key = JSON.stringify([input, window, stride]);
  const { data, loading, error, usingPreview } = useComputation<PoolingResult>(
    () => calculatePooling({ image: input, window, stride }),
    () => localMaxPooling(input, window, stride),
    [key],
  );

  const steps = data?.steps ?? [];
  const engine = useAnimationEngine(steps.length);
  const current = steps[engine.step];

  useRegisterVizContext(moduleId, current ? `region (${current.out_row},${current.out_col})` : "idle", {
    input_shape: data?.input_shape,
    window,
    stride,
    output_shape: data?.output_shape,
    current_max: current?.max,
  });

  if (loading) return <Skeleton className="h-64 w-full" />;
  if (error) return <ErrorBanner title={error.title} detail={error.detail} />;
  if (!data || !current) return null;

  const [wh, ww] = data.window;
  const inputState = (r: number, c: number): CellState => {
    const r0 = current.out_row * data.stride;
    const c0 = current.out_col * data.stride;
    if (r < r0 || r >= r0 + wh || c < c0 || c >= c0 + ww) return "idle";
    const isMax = r - r0 === current.max_position[0] && c - c0 === current.max_position[1];
    return isMax ? "output" : "active";
  };

  return (
    <div className="space-y-4">
      {usingPreview ? <PreviewBanner what="Max pooling" /> : null}
      <div className="flex flex-wrap gap-2 font-mono text-xs">
        <Badge variant="secondary">Input {data.input_shape.join("×")}</Badge>
        <Badge variant="secondary">Window {data.window.join("×")}</Badge>
        <Badge variant="secondary">Stride {data.stride}</Badge>
        <Badge>Output {data.output_shape.join("×")}</Badge>
        <Badge variant="outline">source: {data.source}</Badge>
      </div>

      <div className="grid gap-5 lg:grid-cols-[auto_auto_1fr]">
        <div>
          <p className="mb-2 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
            Feature map
          </p>
          <MatrixGrid matrix={input} cellSize={34} cellState={inputState} />
        </div>
        <div>
          <p className="mb-2 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
            Pooled output
          </p>
          <MatrixGrid
            matrix={current.output_so_far}
            cellSize={34}
            cellState={(r, c) => (r === current.out_row && c === current.out_col ? "output" : "idle")}
          />
        </div>
        <div className="rounded-lg border border-border bg-secondary/30 p-4">
          <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
            Step {current.index + 1} — output position ({current.out_row}, {current.out_col})
          </p>
          <div className="mt-3 flex items-center gap-3">
            <MatrixGrid
              matrix={current.region}
              cellSize={30}
              cellState={(r, c) =>
                r === current.max_position[0] && c === current.max_position[1] ? "output" : "active"
              }
            />
            <span className="text-lg text-muted-foreground">→ max =</span>
            <span className="font-mono text-lg text-primary">{current.max}</span>
          </div>
        </div>
      </div>

      <AnimationControls engine={engine} label="Region" />
    </div>
  );
}
