import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader, VizPanel } from "@/components/VizPanel";
import { StageFlow, type Stage } from "@/components/viz/StageFlow";
import { ModuleCompleteToggle } from "@/components/ModuleCompleteToggle";
import { BackendRequiredBanner } from "@/components/SourceBanner";
import { useRegisterVizContext } from "@/lib/tutor";

export const Route = createFileRoute("/nnunet")({
  head: () => ({
    meta: [
      { title: "nnU-Net v2 Pipeline — NeuroVision Lab" },
      {
        name: "description",
        content:
          "Walk the nnU-Net v2 pipeline: fingerprinting, planning, preprocessing, training, validation and inference.",
      },
      { property: "og:title", content: "nnU-Net v2 Pipeline — NeuroVision Lab" },
      { property: "og:description", content: "The self-configuring segmentation framework, stage by stage." },
    ],
  }),
  component: NnUNetPage,
});

const STAGES: Stage[] = [
  {
    id: "fingerprint",
    title: "1 · Dataset fingerprint",
    summary: "Scans the dataset for spacing, shapes, intensity statistics and modality count.",
    details: ["median spacing", "median shape", "intensity distribution", "number of classes"],
  },
  {
    id: "plan",
    title: "2 · Experiment planning",
    summary: "Derives patch size, batch size, network topology and normalization from the fingerprint.",
    details: ["2d / 3d_fullres / 3d_lowres configs", "GPU-memory-aware patch size", "pooling schedule"],
  },
  {
    id: "preprocess",
    title: "3 · Preprocessing",
    summary: "Resamples to target spacing, crops to non-zero region and normalizes intensities.",
    details: ["resampling", "cropping", "z-score or CT clipping"],
  },
  {
    id: "train",
    title: "4 · Training",
    summary: "5-fold cross-validation with deep supervision, Dice + cross-entropy loss and heavy augmentation.",
    details: ["1000 epochs", "SGD with poly LR", "on-the-fly augmentation"],
  },
  {
    id: "select",
    title: "5 · Configuration selection",
    summary: "Compares validation Dice across configurations and picks the best single model or ensemble.",
  },
  {
    id: "inference",
    title: "6 · Inference",
    summary: "Sliding-window prediction with Gaussian weighting, test-time mirroring and postprocessing.",
    details: ["patch overlap 0.5", "mirroring TTA", "largest-component postprocessing"],
  },
];

function NnUNetPage() {
  const [selected, setSelected] = useState("plan");
  useRegisterVizContext("nnunet", selected, { stage: selected });
  const stage = STAGES.find((s) => s.id === selected);

  return (
    <div>
      <PageHeader
        eyebrow="Segmentation"
        title="nnU-Net v2"
        description="nnU-Net configures itself: it reads the dataset, derives a plan and trains a U-Net without manual architecture search."
      >
        <ModuleCompleteToggle moduleId="nnunet" />
      </PageHeader>

      <div className="mb-4">
        <BackendRequiredBanner feature="Real fingerprints, plans and trained-model results" />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <VizPanel title="Pipeline" subtitle="Six stages" topic="the nnU-Net v2 pipeline">
          <StageFlow stages={STAGES} selectedId={selected} activeId={selected} onSelect={(s) => setSelected(s.id)} />
        </VizPanel>

        <VizPanel title="Stage detail" subtitle={stage?.title ?? ""} topic={`the nnU-Net ${selected} stage`}>
          <p className="text-sm text-muted-foreground">{stage?.summary}</p>
          {stage?.details?.length ? (
            <ul className="mt-3 space-y-1 font-mono text-xs text-muted-foreground">
              {stage.details.map((d) => (
                <li key={d}>· {d}</li>
              ))}
            </ul>
          ) : null}
        </VizPanel>
      </div>
    </div>
  );
}
