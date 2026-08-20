import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Boxes, Gauge, MousePointerClick, Play, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TiltCard } from "@/components/TiltCard";
import { NeuralHero } from "@/components/viz/NeuralHero";
import { VoxelCube } from "@/components/viz/VoxelCube";
import { LayerStack3D } from "@/components/viz/LayerStack3D";
import { KernelSlide3D } from "@/components/viz/KernelSlide3D";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NeuroVision Lab — See How a Neural Network Sees" },
      {
        name: "description",
        content:
          "Start an interactive, no-formula tour of CNNs, U-Net, 3D U-Net and nnU-Net v2 with live 3D tensor visualizations.",
      },
      { property: "og:title", content: "NeuroVision Lab — See How a Neural Network Sees" },
      {
        property: "og:description",
        content: "Click, watch and learn: convolution, pooling, skip connections and segmentation in 3D.",
      },
    ],
  }),
  component: Home,
});

const HIGHLIGHTS = [
  {
    icon: MousePointerClick,
    title: "You click, it moves",
    body: "Paint pixels, slide kernels, step through every multiply and add.",
    tone: "var(--primary)",
  },
  {
    icon: Boxes,
    title: "Real 3D, not diagrams",
    body: "Volumes, layer stacks and sliding windows you can rotate and hover.",
    tone: "var(--bottleneck)",
  },
  {
    icon: Gauge,
    title: "Honest numbers",
    body: "Dice, IoU and tensor shapes computed by the FastAPI backend.",
    tone: "var(--decoder)",
  },
];

function Home() {
  return (
    <div className="space-y-10">
      <section className="aurora glass relative overflow-hidden p-6 text-center lg:p-14">
        <div className="grid-bg pointer-events-none absolute inset-0 opacity-40" aria-hidden />
        <div className="relative mx-auto max-w-3xl">
          <Badge variant="outline" className="gap-1.5 font-mono text-[10px] uppercase tracking-widest">
            <Sparkles className="size-3" /> interactive deep-learning lab
          </Badge>
          <h1 className="mt-5 text-balance text-4xl font-bold leading-tight tracking-tight sm:text-5xl xl:text-6xl">
            See how a neural network <span className="gradient-text">actually sees</span> a medical
            image
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-balance text-base leading-relaxed text-muted-foreground">
            No formulas thrown at you. Ten hands-on modules take you from an 8×8 picture to a full
            U-Net segmentation — every number visible, every step animated.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" className="neon-ring gap-2 px-7">
              <Link to="/dashboard">
                <Play className="size-4" /> Start learning
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="gap-2">
              <Link to="/tutor">
                <Sparkles className="size-4" /> Ask the AI tutor
              </Link>
            </Button>
          </div>
        </div>
        <div className="float-slow relative mx-auto mt-8 h-44 max-w-3xl sm:h-56">
          <NeuralHero />
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {HIGHLIGHTS.map((h) => (
          <TiltCard key={h.title} className="panel p-5">
            <span
              className="mb-3 inline-grid size-9 place-items-center rounded-lg"
              style={{
                color: h.tone,
                background: `color-mix(in oklab, ${h.tone} 14%, transparent)`,
                boxShadow: `inset 0 0 0 1px color-mix(in oklab, ${h.tone} 45%, transparent)`,
              }}
            >
              <h.icon className="size-4" />
            </span>
            <h2 className="text-base font-semibold tracking-tight">{h.title}</h2>
            <p className="mt-1.5 text-sm text-muted-foreground">{h.body}</p>
          </TiltCard>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <div className="panel aurora relative overflow-hidden p-5">
          <h2 className="text-lg font-semibold tracking-tight">The U-Net, layer by layer</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Down the U, then back up. Hover a slab to lift it out of the stack.
          </p>
          <div className="mt-3">
            <LayerStack3D />
          </div>
        </div>

        <div className="grid gap-4">
          <div className="panel p-5">
            <h2 className="text-lg font-semibold tracking-tight">Convolution, in motion</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              A 3×3 window walks the image and looks for one pattern at a time.
            </p>
            <KernelSlide3D />
          </div>
          <div className="panel aurora relative overflow-hidden p-5">
            <h2 className="text-lg font-semibold tracking-tight">Scans are cubes</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              A 3D U-Net reads all three axes at once, not one flat slice.
            </p>
            <VoxelCube />
          </div>
        </div>
      </section>

      <section className="panel flex flex-wrap items-center justify-between gap-4 p-6">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Ready when you are</h2>
          <p className="text-sm text-muted-foreground">
            Nothing is locked — jump into any module from the dashboard.
          </p>
        </div>
        <Button asChild size="lg" className="gap-2">
          <Link to="/dashboard">
            Open the dashboard <ArrowRight className="size-4" />
          </Link>
        </Button>
      </section>
    </div>
  );
}
