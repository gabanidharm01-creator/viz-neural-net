import { Pause, Play, RotateCcw, SkipBack, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import type { AnimationEngine } from "@/hooks/useAnimationEngine";

export function AnimationControls({
  engine,
  label = "Step",
}: {
  engine: AnimationEngine;
  label?: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-secondary/40 px-3 py-2">
      <Button variant="secondary" size="sm" onClick={engine.previous} disabled={engine.step === 0}>
        <SkipBack className="size-4" /> Previous
      </Button>
      <Button size="sm" onClick={engine.toggle}>
        {engine.playing ? <Pause className="size-4" /> : <Play className="size-4" />}
        {engine.playing ? "Pause" : "Play"}
      </Button>
      <Button
        variant="secondary"
        size="sm"
        onClick={engine.next}
        disabled={engine.step >= engine.total - 1}
      >
        Next <SkipForward className="size-4" />
      </Button>
      <Button variant="ghost" size="sm" onClick={engine.reset}>
        <RotateCcw className="size-4" /> Reset
      </Button>

      <div className="flex min-w-40 flex-1 items-center gap-2">
        <span className="font-mono text-xs text-muted-foreground">
          {label} {engine.total === 0 ? 0 : engine.step + 1}/{engine.total}
        </span>
        <Slider
          value={[engine.step]}
          min={0}
          max={Math.max(0, engine.total - 1)}
          step={1}
          onValueChange={([v]) => engine.goTo(v ?? 0)}
          className="flex-1"
        />
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Speed</span>
        <Slider
          value={[engine.speed]}
          min={0.25}
          max={4}
          step={0.25}
          onValueChange={([v]) => engine.setSpeed(v ?? 1)}
          className="w-24"
        />
        <span className="w-10 font-mono text-xs text-muted-foreground">{engine.speed}×</span>
      </div>
    </div>
  );
}
