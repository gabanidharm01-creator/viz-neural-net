import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader, VizPanel } from "@/components/VizPanel";
import { MatrixGrid } from "@/components/viz/MatrixGrid";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { KERNELS, useLabImage } from "@/lib/imageStore";
import { useRegisterVizContext } from "@/lib/tutor";
import { ModuleCompleteToggle } from "@/components/ModuleCompleteToggle";

export const Route = createFileRoute("/playground")({
  head: () => ({
    meta: [
      { title: "CNN Playground — NeuroVision Lab" },
      {
        name: "description",
        content: "Paint an 8×8 input tensor pixel by pixel and choose the kernel used downstream.",
      },
      { property: "og:title", content: "CNN Playground — NeuroVision Lab" },
      { property: "og:description", content: "Edit the 8×8 input tensor that feeds every CNN lesson." },
    ],
  }),
  component: Playground,
});

function Playground() {
  const { image, setPixel, clear, reset, kernelId, setKernelId } = useLabImage();
  const [brush, setBrush] = useState(1);
  useRegisterVizContext("playground", "editing 8×8 input", { image, kernelId });

  return (
    <div>
      <PageHeader
        eyebrow="CNN Basics"
        title="CNN Playground"
        description="This 8×8 tensor is the shared input for the convolution, ReLU and pooling lessons. Click a pixel to paint it with the current brush value."
      >
        <ModuleCompleteToggle moduleId="cnn-basics" />
      </PageHeader>

      <div className="grid gap-4 xl:grid-cols-2">
        <VizPanel title="Input tensor" subtitle="8×8 · single channel" topic="the 8×8 input tensor">
          <MatrixGrid
            matrix={image}
            cellSize={44}
            onCellClick={(r, c) => setPixel(r, c, brush)}
            ariaLabel="Editable 8x8 input image"
          />
          <div className="mt-4 space-y-4">
            <div>
              <Label className="text-xs text-muted-foreground">Brush value: {brush}</Label>
              <Slider
                value={[brush]}
                min={-1}
                max={1}
                step={0.25}
                onValueChange={([v]) => setBrush(v ?? 1)}
                className="mt-2 max-w-xs"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" size="sm" onClick={clear}>
                Clear
              </Button>
              <Button variant="secondary" size="sm" onClick={reset}>
                Reset
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setBrush(0)}>
                Eraser (0)
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Image upload is planned: uploaded images will be downsampled and normalized by the
              backend before they enter the pipeline.
            </p>
          </div>
        </VizPanel>

        <VizPanel title="Kernel" subtitle="Used by the convolution lesson" topic="convolution kernels">
          <div className="grid gap-2 sm:grid-cols-2">
            {Object.entries(KERNELS).map(([id, k]) => (
              <button
                key={id}
                type="button"
                onClick={() => setKernelId(id)}
                className={`rounded-lg border p-3 text-left transition-colors ${
                  kernelId === id ? "border-primary bg-primary/10" : "border-border bg-card hover:border-primary/50"
                }`}
              >
                <p className="text-xs font-medium">{k.label}</p>
                <div className="mt-2">
                  <MatrixGrid matrix={k.kernel} cellSize={24} colorScale={false} decimals={2} />
                </div>
                <p className="mt-2 text-[11px] text-muted-foreground">{k.note}</p>
              </button>
            ))}
          </div>
          <Badge variant="outline" className="mt-4 font-mono text-[10px]">
            selected: {kernelId}
          </Badge>
        </VizPanel>
      </div>
    </div>
  );
}
