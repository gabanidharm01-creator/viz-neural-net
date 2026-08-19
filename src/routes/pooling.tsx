import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader, VizPanel } from "@/components/VizPanel";
import { PoolingVisualizer } from "@/components/viz/PoolingVisualizer";
import { ModuleCompleteToggle } from "@/components/ModuleCompleteToggle";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useLabImage } from "@/lib/imageStore";

export const Route = createFileRoute("/pooling")({
  head: () => ({
    meta: [
      { title: "Max Pooling — NeuroVision Lab" },
      {
        name: "description",
        content: "Watch a pooling window halve the resolution while keeping the strongest response.",
      },
      { property: "og:title", content: "Max Pooling — NeuroVision Lab" },
      { property: "og:description", content: "Animated 2×2 max pooling over a real tensor." },
    ],
  }),
  component: PoolingPage,
});

function PoolingPage() {
  const { image } = useLabImage();
  const [stride, setStride] = useState(2);

  return (
    <div>
      <PageHeader
        eyebrow="CNN Foundations"
        title="Max pooling"
        description="Pooling downsamples the feature map: each window collapses to its maximum, keeping the strongest evidence and shrinking the spatial size."
      >
        <ModuleCompleteToggle moduleId="pooling" />
      </PageHeader>

      <div className="space-y-4">
        <VizPanel title="Parameters" subtitle="2×2 window" topic="pooling stride">
          <div className="max-w-xs">
            <Label className="text-xs text-muted-foreground">Stride: {stride}</Label>
            <Slider
              value={[stride]}
              min={1}
              max={2}
              step={1}
              onValueChange={([v]) => setStride(v ?? 2)}
              className="mt-2"
            />
          </div>
        </VizPanel>

        <VizPanel title="Pooling windows" subtitle="Maximum per region" topic="max pooling">
          <PoolingVisualizer input={image} window={[2, 2]} stride={stride} />
        </VizPanel>
      </div>
    </div>
  );
}
