import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, VizPanel } from "@/components/VizPanel";
import { UNetVisualizer } from "@/components/viz/UNetVisualizer";
import { VolumeViewer } from "@/components/viz/VolumeViewer";
import { ModuleCompleteToggle } from "@/components/ModuleCompleteToggle";

export const Route = createFileRoute("/unet-3d")({
  head: () => ({
    meta: [
      { title: "3D U-Net — NeuroVision Lab" },
      {
        name: "description",
        content: "Navigate an orthogonal volume viewer and see how U-Net shapes change in three dimensions.",
      },
      { property: "og:title", content: "3D U-Net — NeuroVision Lab" },
      { property: "og:description", content: "Volumetric segmentation with axial, coronal and sagittal views." },
    ],
  }),
  component: UNet3DPage,
});

function UNet3DPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Segmentation"
        title="3D U-Net"
        description="Volumetric segmentation processes whole patches instead of slices, so every tensor gains a depth axis and memory cost grows quickly."
      >
        <ModuleCompleteToggle moduleId="unet-3d" />
      </PageHeader>

      <div className="space-y-4">
        <VizPanel title="Volume viewer" subtitle="Axial · coronal · sagittal" topic="orthogonal volume navigation">
          <VolumeViewer />
        </VizPanel>

        <VizPanel title="3D architecture shapes" subtitle="Depth × height × width × features" topic="the 3D U-Net">
          <UNetVisualizer inputSize={64} depth={3} baseFeatures={16} dimensions={3} />
        </VizPanel>
      </div>
    </div>
  );
}
