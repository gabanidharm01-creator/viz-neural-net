import { ArrowDown, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ExplainThis } from "@/components/ExplainThis";
import type { UNetSkip } from "@/lib/types";

export function SkipConnectionVisualizer({ skip }: { skip: UNetSkip }) {
  return (
    <div className="panel space-y-3 p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-wider text-skip">skip connection</p>
          <h3 className="text-sm font-semibold">Level {skip.level + 1}</h3>
        </div>
        <ExplainThis topic={`the U-Net skip connection at level ${skip.level + 1}`} />
      </div>

      <div className="space-y-2 text-center">
        <div className="rounded-md border border-encoder/60 bg-encoder/10 px-3 py-2">
          <p className="text-xs font-medium">Encoder feature map</p>
          <p className="font-mono text-xs text-encoder">{skip.encoder_shape.join("×")}</p>
        </div>
        <Plus className="mx-auto size-4 text-muted-foreground" />
        <div className="rounded-md border border-decoder/60 bg-decoder/10 px-3 py-2">
          <p className="text-xs font-medium">Decoder feature map</p>
          <p className="font-mono text-xs text-decoder">{skip.decoder_shape.join("×")}</p>
        </div>
        <ArrowDown className="mx-auto size-4 text-muted-foreground" />
        <div className="rounded-md border border-skip/60 bg-skip/10 px-3 py-2">
          <p className="text-xs font-medium">Concatenation (channel axis)</p>
          <p className="font-mono text-xs text-skip">{skip.concatenated_shape.join("×")}</p>
        </div>
        <ArrowDown className="mx-auto size-4 text-muted-foreground" />
        <div className="rounded-md border border-border bg-secondary/40 px-3 py-2">
          <p className="text-xs font-medium">Decoder block</p>
        </div>
      </div>

      <div>
        <Badge variant="outline" className="mb-2 font-mono text-[10px]">
          purpose
        </Badge>
        <p className="text-sm text-muted-foreground">{skip.purpose}</p>
      </div>
    </div>
  );
}
