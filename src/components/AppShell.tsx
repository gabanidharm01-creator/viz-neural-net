import { useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import {
  Activity,
  Boxes,
  Brain,
  CircuitBoard,
  Gauge,
  GraduationCap,
  Grid3x3,
  Layers,
  LayoutDashboard,
  Menu,
  Network,
  Scan,
  Sparkles,
  Waves,
  Workflow,
} from "lucide-react";
import { AiTutorPanel } from "@/components/AiTutorPanel";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const NAV: { group: string; items: { to: string; label: string; icon: typeof Brain }[] }[] = [
  {
    group: "Overview",
    items: [{ to: "/", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    group: "CNN Foundations",
    items: [
      { to: "/playground", label: "CNN Playground", icon: Grid3x3 },
      { to: "/convolution", label: "Convolution", icon: CircuitBoard },
      { to: "/relu", label: "ReLU", icon: Activity },
      { to: "/pooling", label: "Max Pooling", icon: Layers },
      { to: "/cnn-workflow", label: "CNN Workflow", icon: Workflow },
    ],
  },
  {
    group: "Segmentation",
    items: [
      { to: "/unet", label: "U-Net", icon: Network },
      { to: "/unet-2d", label: "2D U-Net", icon: Scan },
      { to: "/unet-3d", label: "3D U-Net", icon: Boxes },
      { to: "/nnunet", label: "nnU-Net v2", icon: Waves },
      { to: "/metrics", label: "Metrics", icon: Gauge },
    ],
  },
  {
    group: "Tools",
    items: [
      { to: "/tutor", label: "AI Tutor", icon: Sparkles },
      { to: "/model-inspector", label: "Model Inspector", icon: Brain },
      { to: "/progress", label: "Learning Progress", icon: GraduationCap },
    ],
  },
];

export function AppShell({ children }: { children: ReactNode }) {
  const [navOpen, setNavOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center justify-between border-b border-border bg-background/85 px-4 backdrop-blur">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setNavOpen((o) => !o)}
            aria-label="Toggle navigation"
          >
            <Menu className="size-4" />
          </Button>
          <Link to="/" className="flex items-center gap-2">
            <span className="grid size-7 place-items-center rounded-md bg-primary/15 text-primary">
              <Brain className="size-4" />
            </span>
            <span className="text-sm font-semibold tracking-tight">
              NeuroVision <span className="text-primary">Lab</span>
            </span>
          </Link>
        </div>
        <p className="hidden font-mono text-[11px] text-muted-foreground md:block">
          Interactive U-Net &amp; nnU-Net visualization platform
        </p>
      </header>

      <div className="grid flex-1 grid-cols-1 lg:grid-cols-[15rem_minmax(0,1fr)] xl:grid-cols-[15rem_minmax(0,1fr)_22rem]">
        <nav
          className={cn(
            "border-r border-border bg-sidebar/60 lg:block",
            navOpen ? "block" : "hidden",
          )}
        >
          <ScrollArea className="h-[calc(100vh-3.5rem)]">
            <div className="space-y-5 p-3">
              {NAV.map((group) => (
                <div key={group.group}>
                  <p className="px-2 pb-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    {group.group}
                  </p>
                  <ul className="space-y-0.5">
                    {group.items.map((item) => (
                      <li key={item.to}>
                        <Link
                          to={item.to}
                          onClick={() => setNavOpen(false)}
                          activeOptions={{ exact: item.to === "/" }}
                          className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-sidebar-foreground/85 transition-colors hover:bg-sidebar-accent"
                          activeProps={{
                            className:
                              "bg-sidebar-accent text-sidebar-primary font-medium border-l-2 border-sidebar-primary",
                          }}
                        >
                          <item.icon className="size-4 shrink-0" />
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </ScrollArea>
        </nav>

        <main className="min-w-0 p-5 lg:p-7">{children}</main>

        <div className="hidden h-[calc(100vh-3.5rem)] xl:sticky xl:top-14 xl:block">
          <AiTutorPanel />
        </div>
      </div>
    </div>
  );
}
