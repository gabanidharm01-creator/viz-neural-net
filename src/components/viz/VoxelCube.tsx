/**
 * Pure-CSS rotating 3D cube used to convey volumetric (3D) data.
 * Decorative only — real volumes render in the VolumeViewer.
 */
const FACES: { label: string; transform: string; tone: string }[] = [
  { label: "axial", transform: "translateZ(70px)", tone: "var(--primary)" },
  { label: "coronal", transform: "rotateY(90deg) translateZ(70px)", tone: "var(--accent)" },
  { label: "sagittal", transform: "rotateY(180deg) translateZ(70px)", tone: "var(--decoder)" },
  { label: "depth", transform: "rotateY(-90deg) translateZ(70px)", tone: "var(--encoder)" },
  { label: "z+", transform: "rotateX(90deg) translateZ(70px)", tone: "var(--bottleneck)" },
  { label: "z−", transform: "rotateX(-90deg) translateZ(70px)", tone: "var(--skip)" },
];

export function VoxelCube({ size = 140 }: { size?: number }) {
  return (
    <div
      className="grid place-items-center"
      style={{ perspective: "900px", height: size * 1.9, width: "100%" }}
      aria-hidden
    >
      <div className="cube-3d relative" style={{ width: 140, height: 140 }}>
        {FACES.map((f) => (
          <div
            key={f.label}
            className="absolute inset-0 grid place-items-center rounded-md border font-mono text-[10px] uppercase tracking-widest"
            style={{
              transform: f.transform,
              borderColor: f.tone,
              color: f.tone,
              background: `color-mix(in oklab, ${f.tone} 12%, transparent)`,
              boxShadow: `inset 0 0 30px -12px ${f.tone}`,
            }}
          >
            {f.label}
          </div>
        ))}
      </div>
    </div>
  );
}
