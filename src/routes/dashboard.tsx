import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CheckCircle2,
  Circle,
  Rocket,
  ServerCog,
  Sparkles,
  Trophy,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { TiltCard } from "@/components/TiltCard";
import { NeuralHero } from "@/components/viz/NeuralHero";
import { VoxelCube } from "@/components/viz/VoxelCube";
import { API_BASE_URL } from "@/lib/api";
import { MODULES, useProgress } from "@/lib/progress";
import { useRegisterVizContext } from "@/lib/tutor";

export const Route = createFileRoute("/dashboard")({
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

const PATH: { step: string; title: string; plain: string; body: string; to: string; tone: string }[] = [
  {
    step: "01",
    title: "Paint an image",
    plain: "A picture is just a grid of numbers.",
    body: "Click pixels on an 8×8 grid and watch the numbers change.",
    to: "/playground",
    tone: "var(--primary)",
  },
  {
    step: "02",
    title: "Convolution",
    plain: "A tiny window looks for patterns.",
    body: "Slide a kernel and see every multiply and add, one step at a time.",
    to: "/convolution",
    tone: "var(--encoder)",
  },
  {
    step: "03",
    title: "ReLU",
    plain: "Keep the good signals, drop the rest.",
    body: "Every negative value becomes zero. That's the whole trick.",
    to: "/relu",
    tone: "var(--skip)",
  },
  {
    step: "04",
    title: "Max pooling",
    plain: "Zoom out, keep the loudest voice.",
    body: "A 2×2 window shrinks the picture but keeps the strongest response.",
    to: "/pooling",
    tone: "var(--highlight)",
  },
  {
    step: "05",
    title: "U-Net",
    plain: "Down the U, then back up.",
    body: "Encoder, bottleneck, decoder and the skip connections between them.",
    to: "/unet",
    tone: "var(--bottleneck)",
  },
  {
    step: "06",
    title: "Segmentation",
    plain: "Colour in the thing you care about.",
    body: "Predict a mask and score it with Dice and IoU.",
    to: "/unet-2d",
    tone: "var(--decoder)",
  },
];

function Dashboard() {
  const { completed, percent, completedCount, total } = useProgress();
  useRegisterVizContext("dashboard", "", {});
  const next = MODULES.find((m) => !completed[m.id]) ?? MODULES[0]!;

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="aurora glass relative overflow-hidden p-6 lg:p-10">
        <div className="grid-bg pointer-events-none absolute inset-0 opacity-40" aria-hidden />
        <div className="relative grid items-center gap-8 2xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
          <div>
            <Badge variant="outline" className="gap-1.5 font-mono text-[10px] uppercase tracking-widest">
              <Sparkles className="size-3" /> interactive deep-learning lab
            </Badge>
            <h1 className="mt-4 text-balance text-3xl font-bold leading-tight tracking-tight sm:text-4xl xl:text-5xl">
              See how a neural network <span className="gradient-text">actually sees</span> a
              medical image
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
              No formulas thrown at you. You click, it moves, and every single number is shown.
              Start with an 8×8 picture and finish with a full U-Net segmentation.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Button asChild size="lg" className="neon-ring gap-2">
                <Link to={next.path}>
                  <Rocket className="size-4" /> Continue: {next.label}
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="gap-2">
                <Link to="/tutor">
                  <Sparkles className="size-4" /> Ask the AI tutor
                </Link>
              </Button>
            </div>
          </div>

          <div className="float-slow relative h-44 sm:h-56 xl:h-64">
            <NeuralHero />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="grid gap-4 md:grid-cols-3">
        <TiltCard className="panel shimmer p-5">
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <Trophy className="size-3.5 text-highlight" /> Your progress
          </p>
          <p className="mt-2 text-3xl font-semibold">
            {completedCount}
            <span className="text-base text-muted-foreground">/{total}</span>
          </p>
          <Progress value={percent} className="mt-3 h-1.5" />
          <p className="mt-2 text-xs text-muted-foreground">{percent}% of the lab explored</p>
        </TiltCard>

        <TiltCard className="panel p-5">
          <p className="text-xs text-muted-foreground">Where the maths happens</p>
          <p className="mt-2 flex items-center gap-2 font-mono text-sm break-all">
            <ServerCog className="size-4 shrink-0 text-primary" />
            {API_BASE_URL || "VITE_API_URL not set"}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            All scientific computation runs on the FastAPI backend. Without it you still get a
            clearly-labelled browser preview.
          </p>
        </TiltCard>

        <TiltCard className="panel p-5">
          <p className="text-xs text-muted-foreground">The journey</p>
          <p className="mt-2 font-mono text-xs leading-relaxed text-muted-foreground">
            image → conv → relu → pool → U-Net → skip → mask → AI explanation
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {["2D", "3D", "metrics", "nnU-Net"].map((t) => (
              <Badge key={t} variant="secondary" className="font-mono text-[10px]">
                {t}
              </Badge>
            ))}
          </div>
        </TiltCard>
      </section>

      {/* Learning path */}
      <section>
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Your six-step path</h2>
            <p className="text-sm text-muted-foreground">
              Each step takes a few minutes and builds on the one before it.
            </p>
          </div>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {PATH.map((card) => (
            <TiltCard key={card.to} className="rounded-2xl">
              <Link
                to={card.to}
                className="panel group block h-full overflow-hidden p-5 transition-colors hover:border-primary"
              >
                <span
                  className="mb-3 inline-grid size-9 place-items-center rounded-lg font-mono text-xs font-semibold"
                  style={{
                    color: card.tone,
                    background: `color-mix(in oklab, ${card.tone} 14%, transparent)`,
                    boxShadow: `inset 0 0 0 1px color-mix(in oklab, ${card.tone} 45%, transparent)`,
                  }}
                >
                  {card.step}
                </span>
                <h3 className="text-base font-semibold tracking-tight">{card.title}</h3>
                <p className="mt-1 text-sm" style={{ color: card.tone }}>
                  {card.plain}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">{card.body}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-xs text-primary">
                  Open <ArrowRight className="size-3 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            </TiltCard>
          ))}
        </div>
      </section>

      {/* 3D teaser + module list */}
      <section className="grid gap-4 xl:grid-cols-[22rem_minmax(0,1fr)]">
        <div className="panel aurora relative overflow-hidden p-5">
          <h2 className="text-base font-semibold tracking-tight">Data in three dimensions</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Scans are cubes of numbers, not flat pictures. A 3D U-Net reads all three axes at once.
          </p>
          <VoxelCube />
          <Button asChild variant="outline" size="sm" className="w-full gap-2">
            <Link to="/unet-3d">
              Explore the volume <ArrowRight className="size-3.5" />
            </Link>
          </Button>
        </div>

        <div className="panel p-5">
          <h2 className="text-base font-semibold tracking-tight">All modules</h2>
          <p className="mt-1 text-sm text-muted-foreground">Jump anywhere — nothing is locked.</p>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {MODULES.map((m) => (
              <li key={m.id}>
                <Link
                  to={m.path}
                  className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2.5 text-sm transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-panel"
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
        </div>
      </section>
    </div>
  );
}
