import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader, VizPanel } from "@/components/VizPanel";
import { UNetVisualizer } from "@/components/viz/UNetVisualizer";
import { ModuleCompleteToggle } from "@/components/ModuleCompleteToggle";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

export const Route = createFileRoute("/unet")({
  head: () => ({
    meta: [
      { title: "U-Net Architecture — NeuroVision Lab" },
      {
        name: "description",
        content:
          "Explore the U-Net encoder, bottleneck, decoder and skip connections with live tensor shapes.",
      },
      { property: "og:title", content: "U-Net Architecture — NeuroVision Lab" },
      { property: "og:description", content: "Interactive U-Net diagram with shape tracking at every block." },
    ],
  }),
  component: UNetPage,
});

function UNetPage() {
  const [depth, setDepth] = useState(3);
  const [baseFeatures, setBaseFeatures] = useState(32);
  const [inputSize, setInputSize] = useState(128);

  return (
    <div>
      <PageHeader
        eyebrow="Segmentation"
        title="U-Net"
        description="A contracting encoder captures context, an expanding decoder restores resolution, and skip connections carry fine spatial detail across the U."
      >
        <ModuleCompleteToggle moduleId="unet" />
      </PageHeader>

      <div className="space-y-4">
        <VizPanel title="Architecture parameters" subtitle="Shapes update live" topic="U-Net depth and feature width">
          <div className="grid gap-5 sm:grid-cols-3">
            <div>
              <Label className="text-xs text-muted-foreground">Input size: {inputSize}</Label>
              <Slider
                value={[inputSize]}
                min={64}
                max={256}
                step={64}
                onValueChange={([v]) => setInputSize(v ?? 128)}
                className="mt-2"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Depth: {depth}</Label>
              <Slider
                value={[depth]}
                min={2}
                max={4}
                step={1}
                onValueChange={([v]) => setDepth(v ?? 3)}
                className="mt-2"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Base features: {baseFeatures}</Label>
              <Slider
                value={[baseFeatures]}
                min={8}
                max={64}
                step={8}
                onValueChange={([v]) => setBaseFeatures(v ?? 32)}
                className="mt-2"
              />
            </div>
          </div>
        </VizPanel>

        <VizPanel title="U-Net diagram" subtitle="Click a block or a skip" topic="the U-Net architecture">
          <UNetVisualizer inputSize={inputSize} depth={depth} baseFeatures={baseFeatures} dimensions={2} />
        </VizPanel>
      </div>
    </div>
  );
}
