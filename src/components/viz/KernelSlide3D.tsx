import { useEffect, useState } from "react";

/**
 * Decorative 3D board where a 3×3 kernel walks across a 6×6 grid in
 * perspective — a one-glance answer to "what does convolution do?".
 */
const N = 6;
const K = 3;
const POSITIONS = (N - K + 1) * (N - K + 1);

export function KernelSlide3D() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setStep((s) => (s + 1) % POSITIONS), 700);
    return () => window.clearInterval(id);
  }, []);

  const row = Math.floor(step / (N - K + 1));
  const col = step % (N - K + 1);
  const cell = 34;

  return (
    <div className="grid place-items-center" style={{ perspective: "900px", height: 250 }} aria-hidden>
      <div
        className="relative"
        style={{
          transformStyle: "preserve-3d",
          transform: "rotateX(56deg) rotateZ(-30deg)",
          width: N * cell,
          height: N * cell,
        }}
      >
        {Array.from({ length: N * N }).map((_, i) => {
          const r = Math.floor(i / N);
          const c = i % N;
          const inside = r >= row && r < row + K && c >= col && c < col + K;
          return (
            <div
              key={i}
              className="absolute rounded-[3px] border transition-all duration-300"
              style={{
                width: cell - 4,
                height: cell - 4,
                left: c * cell,
                top: r * cell,
                transform: `translateZ(${inside ? 26 : 0}px)`,
                borderColor: inside ? "var(--primary)" : "var(--border)",
                background: inside
                  ? "color-mix(in oklab, var(--primary) 40%, transparent)"
                  : "color-mix(in oklab, var(--encoder) 12%, transparent)",
                boxShadow: inside ? "0 0 22px -6px var(--primary)" : "none",
              }}
            />
          );
        })}
        <div
          className="absolute rounded-md border-2 transition-all duration-300"
          style={{
            width: K * cell,
            height: K * cell,
            left: col * cell - 2,
            top: row * cell - 2,
            transform: "translateZ(52px)",
            borderColor: "var(--highlight)",
            background: "color-mix(in oklab, var(--highlight) 10%, transparent)",
          }}
        />
      </div>
    </div>
  );
}
