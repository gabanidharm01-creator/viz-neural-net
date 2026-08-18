import { MatrixGrid, type CellState } from "@/components/viz/MatrixGrid";
import { AnimationControls } from "@/components/AnimationControls";
import { PreviewBanner, ErrorBanner } from "@/components/SourceBanner";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useAnimationEngine } from "@/hooks/useAnimationEngine";
import { useComputation } from "@/hooks/useComputation";
import { calculateConvolution } from "@/lib/api";
import { localConvolution } from "@/lib/localPreview";
import type { ConvolutionResult, Matrix } from "@/lib/types";
import { useRegisterVizContext } from "@/lib/tutor";

export function ConvolutionVisualizer({
  image,
  kernel,
  stride = 1,
  padding = 0,
  moduleId = "convolution",
}: {
  image: Matrix;
  kernel: Matrix;
  stride?: number;
  padding?: number;
  moduleId?: string;
}) {
  const key = JSON.stringify([image, kernel, stride, padding]);
  const { data, loading, error, usingPreview } = useComputation<ConvolutionResult>(
    () => calculateConvolution({ image, kernel, stride, padding }),
    () => localConvolution(image, kernel, stride, padding),
    [key],
  );

  const steps = data?.steps ?? [];
  const engine = useAnimationEngine(steps.length);
  const current = steps[engine.step];

  useRegisterVizContext(moduleId, current ? `patch (${current.out_row},${current.out_col})` : "idle", {
    input_shape: data?.input_shape,
    kernel_shape: data?.kernel_shape,
    stride,
    padding,
    output_shape: data?.output_shape,
    current_sum: current?.sum,
  });

  if (loading) return <Skeleton className="h-72 w-full" />;
  if (error) return <ErrorBanner title={error.title} detail={error.detail} />;
  if (!data || !current) return null;

  const kh = data.kernel_shape[0];
  const kw = data.kernel_shape[1];

  const inputState = (r: number, c: number): CellState => {
    const r0 = current.out_row * data.stride - data.padding;
    const c0 = current.out_col * data.stride - data.padding;
    const inWindow = r >= r0 && r < r0 + kh && c >= c0 && c < c0 + kw;
    return inWindow ? "active" : "idle";
  };

  return (
    <div className="space-y-4">
      {usingPreview ? <PreviewBanner what="The convolution" /> : null}

      <div className="flex flex-wrap gap-2 font-mono text-xs">
        <Badge variant="secondary">Input {data.input_shape.join("×")}</Badge>
        <Badge variant="secondary">Kernel {data.kernel_shape.join("×")}</Badge>
        <Badge variant="secondary">Stride {data.stride}</Badge>
        <Badge variant="secondary">Padding {data.padding}</Badge>
        <Badge>Output {data.output_shape.join("×")}</Badge>
        <Badge variant="outline">source: {data.source}</Badge>
      </div>

      <div className="grid gap-5 lg:grid-cols-[auto_auto_1fr]">
        <div>
          <p className="mb-2 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
            Input image
          </p>
          <MatrixGrid matrix={image} cellSize={34} cellState={inputState} ariaLabel="Input image" />
        </div>

        <div>
          <p className="mb-2 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
            Kernel
          </p>
          <MatrixGrid
            matrix={current.kernel}
            cellSize={34}
            colorScale={false}
            cellState={() => "kernel"}
            ariaLabel="Kernel"
          />
          <p className="mt-4 mb-2 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
            Output feature map
          </p>
          <MatrixGrid
            matrix={current.output_so_far}
            cellSize={34}
            cellState={(r, c) =>
              r === current.out_row && c === current.out_col ? "output" : "idle"
            }
            ariaLabel="Output feature map"
          />
        </div>

        <div className="rounded-lg border border-border bg-secondary/30 p-4">
          <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
            Step {current.index + 1} — output position ({current.out_row}, {current.out_col})
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <div>
              <p className="mb-1 text-[10px] text-muted-foreground">patch</p>
              <MatrixGrid matrix={current.patch} cellSize={28} cellState={() => "active"} />
            </div>
            <span className="text-lg text-muted-foreground">⊙</span>
            <div>
              <p className="mb-1 text-[10px] text-muted-foreground">kernel</p>
              <MatrixGrid matrix={current.kernel} cellSize={28} colorScale={false} />
            </div>
            <span className="text-lg text-muted-foreground">=</span>
            <div>
              <p className="mb-1 text-[10px] text-muted-foreground">products</p>
              <MatrixGrid matrix={current.products} cellSize={28} colorScale={false} />
            </div>
          </div>
          <p className="mt-4 font-mono text-sm">
            Σ ={" "}
            {current.products
              .flat()
              .map((v) => (v < 0 ? `(${v})` : v))
              .join(" + ")}{" "}
            = <span className="text-primary">{current.sum}</span>
          </p>
        </div>
      </div>

      <AnimationControls engine={engine} label="Window" />
    </div>
  );
}
