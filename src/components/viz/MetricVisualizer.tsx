import { PreviewBanner, ErrorBanner } from "@/components/SourceBanner";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useComputation } from "@/hooks/useComputation";
import { calculateMetrics } from "@/lib/api";
import { localMetrics } from "@/lib/localPreview";
import type { Matrix, MetricsResult } from "@/lib/types";

const METRICS: { key: keyof MetricsResult; label: string; formula: string }[] = [
  { key: "dice", label: "Dice", formula: "2·TP / (2·TP + FP + FN)" },
  { key: "iou", label: "IoU", formula: "TP / (TP + FP + FN)" },
  { key: "precision", label: "Precision", formula: "TP / (TP + FP)" },
  { key: "recall", label: "Recall", formula: "TP / (TP + FN)" },
];

function Bar({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between font-mono text-[11px] text-muted-foreground">
        <span>{label}</span>
        <span>{count} px</span>
      </div>
      <div className="mt-1 h-3 overflow-hidden rounded-sm bg-secondary">
        <div
          className="h-full transition-all duration-500"
          style={{ width: `${total ? (count / total) * 100 : 0}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

export function MetricVisualizer({
  groundTruth,
  prediction,
}: {
  groundTruth: Matrix;
  prediction: Matrix;
}) {
  const key = JSON.stringify([groundTruth, prediction]);
  const { data, loading, error, usingPreview } = useComputation<MetricsResult>(
    () => calculateMetrics({ ground_truth: groundTruth, prediction }),
    () => localMetrics(groundTruth, prediction),
    [key],
  );

  if (loading) return <Skeleton className="h-56 w-full" />;
  if (error) return <ErrorBanner title={error.title} detail={error.detail} />;
  if (!data) return null;

  const gtCount = data.tp + data.fn;
  const predCount = data.tp + data.fp;
  const maxCount = Math.max(gtCount, predCount, 1);

  return (
    <div className="space-y-4">
      {usingPreview ? <PreviewBanner what="Segmentation metrics" /> : null}
      <Badge variant="outline" className="font-mono text-[10px]">
        source: {data.source}
      </Badge>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-3 rounded-lg border border-border bg-secondary/30 p-4">
          <Bar label="Ground truth" count={gtCount} total={maxCount} color="var(--encoder)" />
          <Bar label="Prediction" count={predCount} total={maxCount} color="var(--decoder)" />
          <Bar label="Overlap (TP)" count={data.tp} total={maxCount} color="var(--primary)" />
          <div className="grid grid-cols-4 gap-2 pt-1 text-center font-mono text-[11px]">
            <div><p className="text-muted-foreground">TP</p><p>{data.tp}</p></div>
            <div><p className="text-muted-foreground">FP</p><p>{data.fp}</p></div>
            <div><p className="text-muted-foreground">FN</p><p>{data.fn}</p></div>
            <div><p className="text-muted-foreground">TN</p><p>{data.tn}</p></div>
          </div>
        </div>

        <div className="space-y-3">
          {METRICS.map((m) => {
            const value = data[m.key] as number;
            return (
              <div key={m.key} className="rounded-lg border border-border bg-card p-3">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm font-medium">{m.label}</span>
                  <span className="font-mono text-lg text-primary">{value.toFixed(3)}</span>
                </div>
                <Progress value={value * 100} className="mt-2 h-1.5" />
                <p className="mt-1 font-mono text-[10px] text-muted-foreground">{m.formula}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
