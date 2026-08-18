import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, Circle, ServerCog } from "lucide-react";
import { PageHeader } from "@/components/VizPanel";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { API_BASE_URL } from "@/lib/api";
import { MODULES, useProgress } from "@/lib/progress";
import { useRegisterVizContext } from "@/lib/tutor";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NeuroVision Lab — Learn U-Net & nnU-Net Visually" },
      {
        name: "description",
        content:
          "An interactive dashboard for learning convolution, pooling, U-Net skip connections, 3D U-Net and the nnU-Net v2 pipeline.",
      },
      { property: "og:title", content: "NeuroVision Lab — Learn U-Net & nnU-Net Visually" },
      {
        property: "og:description",
        content: "Step through real tensor values from CNN basics to the nnU-Net v2 pipeline.",
      },
    ],
  }),
  component: Dashboard,
});

const PATH: { title: string; body: string; to: string }[] = [
  { title: "1 · 8×8 image", body: "Paint pixels and see the raw tensor.", to: "/playground" },
  { title: "2 · Convolution", body: "Slide a kernel, watch every multiply-accumulate.", to: "/convolution" },
  { title: "3 · ReLU", body: "Clamp negatives to zero.", to: "/relu" },
  { title: "4 · Max pooling", body: "Halve the resolution, keep the strongest response.", to: "/pooling" },
  { title: "5 · U-Net", body: "Encoder, bottleneck, decoder and skip connections.", to: "/unet" },
  { title: "6 · Segmentation", body: "Predict a mask and score it with Dice and IoU.", to: "/unet-2d" },
];

function Dashboard() {
  const { completed, percent, completedCount, total } = useProgress();
  useRegisterVizContext("dashboard", "", {});

  return (
    <div>
      <PageHeader
        eyebrow="NeuroVision Lab"
        title="Interactive U-Net & nnU-Net visualization platform"
        description="Every operation is stepped through with real tensor values. Scientific computation is performed by the FastAPI backend; this frontend only renders what the backend returns."
      />

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <div className="panel p-4">
          <p className="text-xs text-muted-foreground">Learning progress</p>
          <p className="mt-1 text-2xl font-semibold">
            {completedCount}
            <span className="text-base text-muted-foreground">/{total}</span>
          </p>
          <Progress value={percent} className="mt-3 h-1.5" />
        </div>
        <div className="panel p-4">
          <p className="text-xs text-muted-foreground">Backend endpoint</p>
          <p className="mt-1 flex items-center gap-2 font-mono text-sm break-all">
            <ServerCog className="size-4 shrink-0 text-primary" />
            {API_BASE_URL || "VITE_API_URL not set"}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Set VITE_API_URL to your FastAPI service for authoritative computation.
          </p>
        </div>
        <div className="panel p-4">
          <p className="text-xs text-muted-foreground">MVP path</p>
          <p className="mt-1 font-mono text-xs leading-relaxed text-muted-foreground">
            image → conv → relu → pool → U-Net → skip → mask → AI explanation
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {PATH.map((card) => (
          <Link
            key={card.to}
            to={card.to}
            className="panel group p-5 transition-colors hover:border-primary"
          >
            <p className="font-mono text-[11px] uppercase tracking-wider text-primary">{card.title}</p>
            <p className="mt-2 text-sm text-muted-foreground">{card.body}</p>
            <span className="mt-3 inline-flex items-center gap-1 text-xs text-primary">
              Open <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        ))}
      </div>

      <section className="panel mt-6 p-5">
        <h2 className="text-base font-semibold tracking-tight">All modules</h2>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {MODULES.map((m) => (
            <li key={m.id}>
              <Link
                to={m.path}
                className="flex items-center justify-between rounded-md border border-border bg-card px-3 py-2 text-sm transition-colors hover:border-primary"
              >
                <span className="flex items-center gap-2">
                  {completed[m.id] ? (
                    <CheckCircle2 className="size-4 text-positive" />
                  ) : (
                    <Circle className="size-4 text-muted-foreground" />
                  )}
                  {m.label}
                </span>
                <Badge variant="outline" className="font-mono text-[10px]">
                  {completed[m.id] ? "done" : "todo"}
                </Badge>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
