import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader, VizPanel } from "@/components/VizPanel";
import { ConvolutionVisualizer } from "@/components/viz/ConvolutionVisualizer";
import { ModuleCompleteToggle } from "@/components/ModuleCompleteToggle";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useLabImage } from "@/lib/imageStore";

export const Route = createFileRoute("/convolution")({
  head: () => ({
    meta: [
      { title: "Convolution — NeuroVision Lab" },
      {
        name: "description",
        content:
          "Step a kernel across an 8×8 tensor and watch every multiply-accumulate that builds the feature map.",
      },
      { property: "og:title", content: "Convolution — NeuroVision Lab" },
      {
        property: "og:description",
        content: "Animated sliding-window convolution with real numbers at each position.",
      },
    ],
  }),
  component: ConvolutionPage,
});

function ConvolutionPage() {
  const { image, kernel } = useLabImage();
  const [stride, setStride] = useState(1);
  const [padding, setPadding] = useState(0);

  return (
    <div>
      <PageHeader
        eyebrow="CNN Foundations"
        title="Convolution"
        description="The kernel slides over the input; each position produces one output value from an element-wise multiply and a sum."
      >
        <ModuleCompleteToggle moduleId="convolution" />
      </PageHeader>

      <div className="space-y-4">
        <VizPanel title="Parameters" subtitle="Applied to the shared 8×8 input" topic="stride and padding">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label className="text-xs text-muted-foreground">Stride: {stride}</Label>
              <Slider
                value={[stride]}
                min={1}
                max={3}
                step={1}
                onValueChange={([v]) => setStride(v ?? 1)}
                className="mt-2"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Padding: {padding}</Label>
              <Slider
                value={[padding]}
                min={0}
                max={2}
                step={1}
                onValueChange={([v]) => setPadding(v ?? 0)}
                className="mt-2"
              />
            </div>
          </div>
        </VizPanel>

        <VizPanel title="Sliding window" subtitle="Every multiply-accumulate" topic="the convolution operation">
          <ConvolutionVisualizer image={image} kernel={kernel} stride={stride} padding={padding} />
        </VizPanel>
      </div>
    </div>
  );
}
