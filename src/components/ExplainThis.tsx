import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { askTutor } from "@/lib/tutor";

/**
 * Sends the current visualization context to the AI Tutor panel, which posts
 * it to the backend /ai/explain endpoint.
 */
export function ExplainThis({ topic }: { topic: string }) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => askTutor(`Explain this: ${topic}`)}
      className="gap-1.5"
    >
      <Sparkles className="size-3.5" /> Explain this
    </Button>
  );
}
