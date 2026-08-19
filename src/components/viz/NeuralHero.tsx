import { useMemo } from "react";

const LAYERS = [4, 6, 6, 4, 2];

/**
 * Decorative animated network graphic for the dashboard hero.
 * Deterministic geometry — no data, no computation.
 */
export function NeuralHero() {
  const { nodes, edges } = useMemo(() => {
    const width = 620;
    const height = 260;
    const nodes: { id: string; x: number; y: number; layer: number }[] = [];
    LAYERS.forEach((count, li) => {
      const x = 50 + (li * (width - 100)) / (LAYERS.length - 1);
      for (let i = 0; i < count; i++) {
        const y = (height / (count + 1)) * (i + 1);
        nodes.push({ id: `${li}-${i}`, x, y, layer: li });
      }
    });
    const edges: { from: (typeof nodes)[number]; to: (typeof nodes)[number]; d: number }[] = [];
    for (let li = 0; li < LAYERS.length - 1; li++) {
      const a = nodes.filter((n) => n.layer === li);
      const b = nodes.filter((n) => n.layer === li + 1);
      a.forEach((from, i) =>
        b.forEach((to, j) => edges.push({ from, to, d: (i + j + li) % 5 })),
      );
    }
    return { nodes, edges };
  }, []);

  return (
    <svg
      viewBox="0 0 620 260"
      className="h-full w-full"
      role="img"
      aria-label="Animated neural network illustration"
    >
      <defs>
        <linearGradient id="nh-edge" x1="0" x2="1">
          <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.15" />
          <stop offset="50%" stopColor="var(--accent)" stopOpacity="0.55" />
          <stop offset="100%" stopColor="var(--decoder)" stopOpacity="0.15" />
        </linearGradient>
        <radialGradient id="nh-node">
          <stop offset="0%" stopColor="var(--primary)" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.35" />
        </radialGradient>
      </defs>

      {edges.map((e, i) => (
        <line
          key={i}
          x1={e.from.x}
          y1={e.from.y}
          x2={e.to.x}
          y2={e.to.y}
          stroke="url(#nh-edge)"
          strokeWidth={0.9}
          className="flow-dash"
          style={{ animationDelay: `${e.d * 0.18}s` }}
        />
      ))}

      {nodes.map((n, i) => (
        <g key={n.id}>
          <circle cx={n.x} cy={n.y} r={11} fill="var(--primary)" opacity={0.08} />
          <circle cx={n.x} cy={n.y} r={5.5} fill="url(#nh-node)">
            <animate
              attributeName="r"
              values="5;7.5;5"
              dur="2.6s"
              begin={`${(i % 7) * 0.22}s`}
              repeatCount="indefinite"
            />
          </circle>
        </g>
      ))}
    </svg>
  );
}
