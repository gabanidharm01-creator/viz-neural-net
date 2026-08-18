import { cn } from "@/lib/utils";
import type { Matrix } from "@/lib/types";

export type CellState = "idle" | "active" | "kernel" | "output" | "positive" | "negative" | "muted";

export interface MatrixGridProps {
  matrix: (number | null)[][];
  cellSize?: number;
  className?: string;
  showValues?: boolean;
  colorScale?: boolean;
  decimals?: number;
  cellState?: (row: number, col: number, value: number | null) => CellState;
  onCellClick?: (row: number, col: number, value: number | null) => void;
  ariaLabel?: string;
}

const stateClasses: Record<CellState, string> = {
  idle: "border-border",
  active: "border-highlight ring-2 ring-highlight z-10",
  kernel: "border-accent ring-2 ring-accent z-10",
  output: "border-primary ring-2 ring-primary z-10",
  positive: "border-positive",
  negative: "border-negative",
  muted: "border-border opacity-40",
};

export function MatrixGrid({
  matrix,
  cellSize = 40,
  className,
  showValues = true,
  colorScale = true,
  decimals = 2,
  cellState,
  onCellClick,
  ariaLabel,
}: MatrixGridProps) {
  const flat = matrix.flat().filter((v): v is number => typeof v === "number");
  const min = flat.length ? Math.min(...flat) : 0;
  const max = flat.length ? Math.max(...flat) : 1;
  const span = max - min || 1;

  const format = (v: number) => {
    const rounded = Math.round(v * 10 ** decimals) / 10 ** decimals;
    return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(decimals);
  };

  return (
    <div
      className={cn("inline-grid gap-[3px]", className)}
      style={{ gridTemplateColumns: `repeat(${matrix[0]?.length ?? 0}, ${cellSize}px)` }}
      role="grid"
      aria-label={ariaLabel}
    >
      {matrix.map((row, r) =>
        row.map((value, c) => {
          const state = cellState?.(r, c, value) ?? "idle";
          const intensity = value === null ? 0 : (value - min) / span;
          return (
            <button
              key={`${r}-${c}`}
              type="button"
              disabled={!onCellClick}
              onClick={() => onCellClick?.(r, c, value)}
              className={cn(
                "tensor-cell flex items-center justify-center rounded-[4px] border text-[11px] font-medium",
                stateClasses[state],
                onCellClick && "cursor-pointer hover:scale-105",
                value === null && "bg-muted/30 text-muted-foreground",
              )}
              style={{
                width: cellSize,
                height: cellSize,
                ...(value !== null && colorScale
                  ? {
                      backgroundColor:
                        value < 0
                          ? `color-mix(in oklch, var(--negative) ${Math.min(90, Math.abs(value / (Math.abs(min) || 1)) * 80 + 10)}%, transparent)`
                          : `color-mix(in oklch, var(--primary) ${Math.round(intensity * 78) + 6}%, transparent)`,
                      color: intensity > 0.55 || value < 0 ? "var(--background)" : "var(--foreground)",
                    }
                  : {}),
              }}
            >
              {showValues && value !== null ? format(value) : ""}
            </button>
          );
        }),
      )}
    </div>
  );
}

export function shapeLabel(matrix: Matrix | (number | null)[][]) {
  return `${matrix.length}×${matrix[0]?.length ?? 0}`;
}
