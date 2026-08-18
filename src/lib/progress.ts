import { useCallback, useSyncExternalStore } from "react";

export const MODULES = [
  { id: "cnn-basics", label: "CNN Basics", path: "/playground" },
  { id: "convolution", label: "Convolution", path: "/convolution" },
  { id: "relu", label: "ReLU", path: "/relu" },
  { id: "pooling", label: "Max Pooling", path: "/pooling" },
  { id: "cnn-workflow", label: "CNN Workflow", path: "/cnn-workflow" },
  { id: "unet", label: "U-Net", path: "/unet" },
  { id: "unet-2d", label: "2D U-Net", path: "/unet-2d" },
  { id: "unet-3d", label: "3D U-Net", path: "/unet-3d" },
  { id: "nnunet", label: "nnU-Net v2", path: "/nnunet" },
  { id: "metrics", label: "Metrics", path: "/metrics" },
] as const;

export type ModuleId = (typeof MODULES)[number]["id"];

const STORAGE_KEY = "neurovision.progress";

/**
 * Progress is stored in localStorage today. The store is intentionally
 * behind a small interface so it can be swapped for backend persistence.
 */
let completed: Record<string, boolean> = {};
let hydrated = false;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

function subscribe(listener: () => void) {
  if (!hydrated && typeof window !== "undefined") {
    hydrated = true;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        completed = JSON.parse(raw) as Record<string, boolean>;
        queueMicrotask(emit);
      }
    } catch {
      /* ignore */
    }
  }
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const getSnapshot = () => completed;

export function useProgress() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const setCompleted = useCallback((id: string, value: boolean) => {
    completed = { ...completed, [id]: value };
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(completed));
    } catch {
      /* ignore */
    }
    emit();
  }, []);

  const resetAll = useCallback(() => {
    completed = {};
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    emit();
  }, []);

  const completedCount = MODULES.filter((m) => state[m.id]).length;

  return {
    completed: state,
    setCompleted,
    resetAll,
    completedCount,
    total: MODULES.length,
    percent: Math.round((completedCount / MODULES.length) * 100),
  };
}
