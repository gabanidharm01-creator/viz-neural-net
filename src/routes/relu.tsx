import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, VizPanel } from "@/components/VizPanel";
import { ReluVisualizer } from "@/components/viz/ReluVisualizer";
import { ModuleCompleteToggle } from "@/components/ModuleCompleteToggle";
import { useLabImage } from "@/lib/imageStore";
import { useRegisterVizContext } from "@/lib/tutor";

export const Route = createFileRoute("/relu")({
  head: () => ({
    meta: [
      { title: "ReLU Activation — NeuroVision Lab" },
      {
        name: "description",
        content: "See exactly which activations a ReLU clamps to zero and why non-linearity matters.",
      },
      { property: "og:title", content: "ReLU Activation — NeuroVision Lab" },
      { property: "og:description", content: "f(x) = max(0, x), visualized cell by cell." },
    ],
  }),
  component: ReluPage,
});

function ReluPage() {
  const { image } = useLabImage();
  useRegisterVizContext("relu", "activation", { shape: [image.length, image[0]?.length ?? 0] });

  return (
    <div>
      <PageHeader
        eyebrow="CNN Foundations"
        title="ReLU activation"
        description="ReLU introduces non-linearity by clamping every negative response to zero while leaving positive responses untouched."
      >
        <ModuleCompleteToggle moduleId="relu" />
      </PageHeader>

      <VizPanel title="ReLU on the shared input" subtitle="f(x) = max(0, x)" topic="the ReLU activation function">
        <ReluVisualizer input={image} />
      </VizPanel>
    </div>
  );
}
