import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader, VizPanel } from "@/components/VizPanel";
import { StageFlow, type Stage } from "@/components/viz/StageFlow";
import { FeatureMapVisualizer } from "@/components/viz/FeatureMapVisualizer";
import { ModuleCompleteToggle } from "@/components/ModuleCompleteToggle";
import { PreviewBanner } from "@/components/SourceBanner";
import { useLabImage } from "@/lib/imageStore";
import { localConvolution, localMaxPooling, localRelu } from "@/lib/localPreview";
import { useRegisterVizContext } from "@/lib/tutor";

export const Route = createFileRoute("/cnn-workflow")({
  head: () => ({
    meta: [
      { title: "CNN Workflow — NeuroVision Lab" },
      {
        name: "description",
        content: "Follow one tensor end to end: input, convolution, ReLU and pooling, stage by stage.",
      },
      { property: "og:title", content: "CNN Workflow — NeuroVision Lab" },
      { property: "og:description", content: "The full CNN forward pass with real intermediate tensors." },
    ],
  }),
  component: CnnWorkflowPage,
});

function CnnWorkflowPage() {
  const { image, kernel } = useLabImage();
  const conv = localConvolution(image, kernel, 1, 0);
  const relu = localRelu(conv.output);
  const pool = localMaxPooling(relu.output, [2, 2], 2);

  const maps: Record<string, number[][]> = {
    input: image,
    conv: conv.output,
    relu: relu.output,
    pool: pool.output,
  };

  const stages: Stage[] = [
    {
      id: "input",
      title: "Input tensor",
      shape: `${image.length}×${image[0]?.length ?? 0}`,
      summary: "The raw single-channel image entering the network.",
    },
    {
      id: "conv",
      title: "Convolution",
      shape: conv.output_shape.join("×"),
      summary: "Kernel slides over the input producing a feature map.",
      details: ["stride 1", "padding 0", `kernel ${conv.kernel_shape.join("×")}`],
    },
    {
      id: "relu",
      title: "ReLU",
      shape: conv.output_shape.join("×"),
      summary: `Non-linearity clamps ${relu.clamped.length} negative values to zero.`,
    },
    {
      id: "pool",
      title: "Max pooling",
      shape: pool.output_shape.join("×"),
      summary: "2×2 window keeps the strongest response and halves the resolution.",
    },
  ];

  const [selected, setSelected] = useState<string>("conv");
  useRegisterVizContext("cnn-workflow", selected, { stage: selected });

  return (
    <div>
      <PageHeader
        eyebrow="CNN Foundations"
        title="CNN workflow"
        description="One tensor, four stages. Select a stage to inspect the exact values it produces."
      >
        <ModuleCompleteToggle moduleId="cnn-workflow" />
      </PageHeader>

      <div className="mb-4">
        <PreviewBanner what="This chained forward pass" />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <VizPanel title="Data flow" subtitle="Input → conv → ReLU → pool" topic="the CNN forward pass">
          <StageFlow stages={stages} selectedId={selected} activeId={selected} onSelect={(s) => setSelected(s.id)} />
        </VizPanel>

        <VizPanel title="Stage output" subtitle={`Selected: ${selected}`} topic={`the ${selected} stage output`}>
          <FeatureMapVisualizer
            title={selected}
            matrix={maps[selected] ?? image}
            cellSize={34}
            showValues
          />
        </VizPanel>
      </div>
    </div>
  );
}
