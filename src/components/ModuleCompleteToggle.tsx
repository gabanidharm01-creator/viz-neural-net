import { CheckCircle2, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProgress } from "@/lib/progress";

export function ModuleCompleteToggle({ moduleId }: { moduleId: string }) {
  const { completed, setCompleted } = useProgress();
  const done = Boolean(completed[moduleId]);

  return (
    <Button
      variant={done ? "secondary" : "outline"}
      size="sm"
      onClick={() => setCompleted(moduleId, !done)}
      className="gap-1.5"
    >
      {done ? <CheckCircle2 className="size-4 text-positive" /> : <Circle className="size-4" />}
      {done ? "Completed" : "Mark as complete"}
    </Button>
  );
}
