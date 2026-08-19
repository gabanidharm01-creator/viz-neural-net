import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, VizPanel } from "@/components/VizPanel";
import { MetricVisualizer } from "@/components/viz/MetricVisualizer";
import { FeatureMapVisualizer } from "@/components/viz/FeatureMapVisualizer";
import { ModuleCompleteToggle } from "@/components/ModuleCompleteToggle";
import { syntheticMri } from "@/lib/demoData";
import { useRegisterVizContext } from "@/lib/tutor";

export const Route = createFileRoute("/metrics")({
  head: () => ({
    meta: [
      { title: "Segmentation Metrics — NeuroVision Lab" },
      {
        name: "description",
        content: "Understand Dice, IoU, precision and recall from the true/false positive counts behind them.",
      },
      { property: "og:title", content: "Segmentation Metrics — NeuroVision Lab" },
      { property: "og:description", content: "Overlap metrics explained with a visual confusion breakdown." },
    ],
  }),
  component: MetricsPage,
});

function MetricsPage() {
  const { groundTruth, prediction } = syntheticMri(32);
  useRegisterVizContext("metrics", "scoring", {});

  return (
    <div>
      <PageHeader
        eyebrow="Segmentation"
        title="Metrics"
        description="Dice and IoU both measure overlap, but they punish errors differently. Precision and recall separate over-segmentation from missed structure."
      >
        <ModuleCompleteToggle moduleId="metrics" />
      </PageHeader>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <VizPanel title="Masks compared" subtitle="Ground truth vs prediction" topic="comparing masks">
          <div className="grid gap-4 sm:grid-cols-2">
            <FeatureMapVisualizer title="ground truth" matrix={groundTruth} cellSize={11} />
            <FeatureMapVisualizer title="prediction" matrix={prediction} cellSize={11} />
          </div>
        </VizPanel>

        <VizPanel title="Scores" subtitle="Computed from TP / FP / FN" topic="Dice, IoU, precision and recall">
          <MetricVisualizer groundTruth={groundTruth} prediction={prediction} />
        </VizPanel>
      </div>
    </div>
  );
}
