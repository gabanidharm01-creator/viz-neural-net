import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, VizPanel } from "@/components/VizPanel";
import { FeatureMapVisualizer } from "@/components/viz/FeatureMapVisualizer";
import { MetricVisualizer } from "@/components/viz/MetricVisualizer";
import { ModuleCompleteToggle } from "@/components/ModuleCompleteToggle";
import { Badge } from "@/components/ui/badge";
import { syntheticMri } from "@/lib/demoData";
import { useRegisterVizContext } from "@/lib/tutor";

export const Route = createFileRoute("/unet-2d")({
  head: () => ({
    meta: [
      { title: "2D U-Net Segmentation — NeuroVision Lab" },
      {
        name: "description",
        content: "Compare a demo 2D slice, its ground-truth mask and a predicted mask scored with Dice and IoU.",
      },
      { property: "og:title", content: "2D U-Net Segmentation — NeuroVision Lab" },
      { property: "og:description", content: "Slice in, mask out — with overlap metrics on the result." },
    ],
  }),
  component: UNet2DPage,
});

function UNet2DPage() {
  const { image, groundTruth, prediction } = syntheticMri(32);
  useRegisterVizContext("unet-2d", "segmentation demo", { size: 32 });

  return (
    <div>
      <PageHeader
        eyebrow="Segmentation"
        title="2D U-Net demo"
        description="A single 2D slice goes in and a per-pixel mask comes out. The masks below are a labelled synthetic phantom used for teaching — real predictions come from the backend."
      >
        <ModuleCompleteToggle moduleId="unet-2d" />
      </PageHeader>

      <div className="grid gap-4 xl:grid-cols-3">
        <VizPanel title="Input slice" subtitle="32×32 demo phantom" topic="the 2D input slice">
          <FeatureMapVisualizer title="image" matrix={image} cellSize={12} />
          <Badge variant="outline" className="mt-3 font-mono text-[10px]">
            synthetic demo data
          </Badge>
        </VizPanel>
        <VizPanel title="Ground truth" subtitle="Reference mask" topic="segmentation ground truth">
          <FeatureMapVisualizer title="mask" matrix={groundTruth} cellSize={12} />
        </VizPanel>
        <VizPanel title="Prediction" subtitle="Demo predicted mask" topic="a predicted segmentation mask">
          <FeatureMapVisualizer title="prediction" matrix={prediction} cellSize={12} />
        </VizPanel>
      </div>

      <VizPanel className="mt-4" title="Overlap metrics" subtitle="Dice, IoU, precision, recall" topic="Dice and IoU">
        <MetricVisualizer groundTruth={groundTruth} prediction={prediction} />
      </VizPanel>
    </div>
  );
}
