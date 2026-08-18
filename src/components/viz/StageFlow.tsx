import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Stage {
  id: string;
  title: string;
  shape?: string;
  summary: string;
  details?: string[];
}

/**
 * Reusable vertical data-flow diagram used by the CNN workflow, preprocessing,
 * inference, training and nnU-Net pipelines.
 */
export function StageFlow({
  stages,
  activeId,
  selectedId,
  onSelect,
  orientation = "vertical",
}: {
  stages: Stage[];
  activeId?: string | undefined;
  selectedId?: string | undefined;
  onSelect?: (stage: Stage) => void;
  orientation?: "vertical" | "grid";
}) {
  return (
    <div
      className={cn(
        orientation === "vertical"
          ? "flex flex-col items-center gap-1"
          : "grid gap-2 sm:grid-cols-2 lg:grid-cols-3",
      )}
    >
      {stages.map((stage, i) => (
        <div key={stage.id} className={cn(orientation === "vertical" && "flex w-full max-w-md flex-col items-center")}>
          <button
            type="button"
            onClick={() => onSelect?.(stage)}
            className={cn(
              "w-full rounded-lg border bg-card px-4 py-3 text-left transition-all",
              onSelect && "cursor-pointer hover:border-primary",
              selectedId === stage.id ? "border-primary shadow-glow" : "border-border",
              activeId === stage.id && "border-highlight bg-highlight/10",
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium">{stage.title}</span>
              {stage.shape ? (
                <span className="font-mono text-[11px] text-primary">{stage.shape}</span>
              ) : null}
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">{stage.summary}</p>
          </button>
          {orientation === "vertical" && i < stages.length - 1 ? (
            <ChevronDown className="my-0.5 size-4 shrink-0 text-muted-foreground" />
          ) : null}
        </div>
      ))}
    </div>
  );
}
