import { ArrowDown } from "lucide-react";
import { MatrixGrid } from "@/components/viz/MatrixGrid";
import { PreviewBanner, ErrorBanner } from "@/components/SourceBanner";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useComputation } from "@/hooks/useComputation";
import { calculateRelu } from "@/lib/api";
import { localRelu } from "@/lib/localPreview";
import type { Matrix, ReluResult } from "@/lib/types";

export function ReluVisualizer({ input }: { input: Matrix }) {
  const key = JSON.stringify(input);
  const { data, loading, error, usingPreview } = useComputation<ReluResult>(
    () => calculateRelu(input),
    () => localRelu(input),
    [key],
  );

  if (loading) return <Skeleton className="h-64 w-full" />;
  if (error) return <ErrorBanner title={error.title} detail={error.detail} />;
  if (!data) return null;

  const clampedSet = new Set(data.clamped.map(([r, c]) => `${r}-${c}`));

  return (
    <div className="space-y-4">
      {usingPreview ? <PreviewBanner what="ReLU" /> : null}
      <div className="flex flex-wrap gap-2 font-mono text-xs">
        <Badge variant="secondary">f(x) = max(0, x)</Badge>
        <Badge variant="secondary">{data.clamped.length} negative values clamped</Badge>
        <Badge variant="outline">source: {data.source}</Badge>
      </div>

      <div className="flex flex-col items-center gap-3">
        <div>
          <p className="mb-2 text-center font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
            Input feature map
          </p>
          <MatrixGrid
            matrix={data.input}
            cellSize={34}
            cellState={(r, c) => (clampedSet.has(`${r}-${c}`) ? "negative" : "idle")}
          />
        </div>
        <div className="flex flex-col items-center text-primary">
          <ArrowDown className="size-5 animate-bounce" />
          <span className="rounded-md border border-primary/40 bg-primary/10 px-3 py-1 font-mono text-xs">
            ReLU
          </span>
          <ArrowDown className="size-5 animate-bounce" />
        </div>
        <div>
          <p className="mb-2 text-center font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
            Output feature map
          </p>
          <MatrixGrid
            matrix={data.output}
            cellSize={34}
            cellState={(r, c) => (clampedSet.has(`${r}-${c}`) ? "active" : "idle")}
          />
        </div>
      </div>
      <p className="text-center text-xs text-muted-foreground">
        Highlighted cells were negative before the activation and are now exactly zero.
      </p>
    </div>
  );
}
