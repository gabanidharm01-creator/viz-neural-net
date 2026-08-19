import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, VizPanel } from "@/components/VizPanel";
import { BackendRequiredBanner } from "@/components/SourceBanner";
import { TensorVisualizer } from "@/components/viz/FeatureMapVisualizer";
import { useRegisterVizContext } from "@/lib/tutor";

export const Route = createFileRoute("/model-inspector")({
  head: () => ({
    meta: [
      { title: "Model Inspector — NeuroVision Lab" },
      {
        name: "description",
        content: "Inspect layer shapes, parameter counts and memory footprint of a segmentation model.",
      },
      { property: "og:title", content: "Model Inspector — NeuroVision Lab" },
      { property: "og:description", content: "Layer-by-layer inspection backed by the FastAPI service." },
    ],
  }),
  component: ModelInspectorPage,
});

function ModelInspectorPage() {
  useRegisterVizContext("model-inspector", "", {});

  return (
    <div>
      <PageHeader
        eyebrow="Tools"
        title="Model inspector"
        description="Layer shapes, parameter counts and activation memory are read from a real checkpoint by the backend — the frontend never estimates them."
      />

      <div className="mb-4">
        <BackendRequiredBanner feature="Checkpoint inspection (layers, parameters, activation memory)" />
      </div>

      <VizPanel title="What the inspector reports" subtitle="Once a backend is connected" topic="model inspection">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <TensorVisualizer label="Input tensor" shape={[1, 1, 128, 128]} />
          <TensorVisualizer label="Bottleneck (example)" shape={[1, 256, 16, 16]} />
          <TensorVisualizer label="Output logits" shape={[1, 2, 128, 128]} />
        </div>
        <ul className="mt-4 space-y-1 text-sm text-muted-foreground">
          <li>· Per-layer output shape and parameter count</li>
          <li>· Trainable vs frozen parameters</li>
          <li>· Estimated activation memory per patch size</li>
          <li>· Normalization, activation and dropout configuration</li>
        </ul>
      </VizPanel>
    </div>
  );
}
