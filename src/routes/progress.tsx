import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Circle, RotateCcw } from "lucide-react";
import { PageHeader } from "@/components/VizPanel";
import { Button } from "@/components/ui/button";
import { Progress as ProgressBar } from "@/components/ui/progress";
import { MODULES, useProgress } from "@/lib/progress";
import { useRegisterVizContext } from "@/lib/tutor";

export const Route = createFileRoute("/progress")({
  head: () => ({
    meta: [
      { title: "Learning Progress — NeuroVision Lab" },
      {
        name: "description",
        content: "Track which CNN and segmentation modules you have completed across the lab.",
      },
      { property: "og:title", content: "Learning Progress — NeuroVision Lab" },
      { property: "og:description", content: "Your module-by-module completion across NeuroVision Lab." },
    ],
  }),
  component: ProgressPage,
});

function ProgressPage() {
  const { completed, setCompleted, resetAll, percent, completedCount, total } = useProgress();
  useRegisterVizContext("progress", "", { completedCount, total });

  return (
    <div>
      <PageHeader
        eyebrow="Tools"
        title="Learning progress"
        description="Progress is stored in this browser. Mark a module complete from its page or here."
      />

      <div className="panel mb-6 p-5">
        <div className="flex items-center justify-between gap-4">
          <p className="text-2xl font-semibold">
            {completedCount}
            <span className="text-base text-muted-foreground">/{total} modules</span>
          </p>
          <Button variant="secondary" size="sm" onClick={resetAll} className="gap-1.5">
            <RotateCcw className="size-3.5" /> Reset
          </Button>
        </div>
        <ProgressBar value={percent} className="mt-4 h-1.5" />
      </div>

      <ul className="grid gap-2 sm:grid-cols-2">
        {MODULES.map((m) => (
          <li
            key={m.id}
            className="flex items-center justify-between rounded-md border border-border bg-card px-3 py-2"
          >
            <Link to={m.path} className="flex items-center gap-2 text-sm hover:text-primary">
              {completed[m.id] ? (
                <CheckCircle2 className="size-4 text-positive" />
              ) : (
                <Circle className="size-4 text-muted-foreground" />
              )}
              {m.label}
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCompleted(m.id, !completed[m.id])}
              className="font-mono text-[10px]"
            >
              {completed[m.id] ? "undo" : "mark done"}
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
