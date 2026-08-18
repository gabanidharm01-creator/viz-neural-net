import { useEffect, useSyncExternalStore } from "react";

export interface VizContext {
  module: string;
  step: string;
  state: Record<string, unknown>;
}

let context: VizContext = { module: "dashboard", step: "", state: {} };
const contextListeners = new Set<() => void>();
const askListeners = new Set<(question: string) => void>();

const emit = () => contextListeners.forEach((l) => l());

export function setVizContext(next: VizContext) {
  context = next;
  emit();
}

function subscribe(listener: () => void) {
  contextListeners.add(listener);
  return () => contextListeners.delete(listener);
}

const getSnapshot = () => context;

export function useVizContext() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

/** Pages call this to keep the AI Tutor aware of what is on screen. */
export function useRegisterVizContext(module: string, step: string, state: Record<string, unknown>) {
  const serialized = JSON.stringify(state);
  useEffect(() => {
    setVizContext({ module, step, state: JSON.parse(serialized) as Record<string, unknown> });
  }, [module, step, serialized]);
}

export function askTutor(question: string) {
  askListeners.forEach((l) => l(question));
}

export function onAskTutor(listener: (question: string) => void) {
  askListeners.add(listener);
  return () => askListeners.delete(listener);
}

export const SUGGESTED_QUESTIONS = [
  "What is convolution?",
  "Why does pooling reduce the image?",
  "What is a feature map?",
  "Why does U-Net use skip connections?",
  "What is the bottleneck?",
  "What is the difference between U-Net and nnU-Net?",
  "Why use 3D U-Net?",
  "Explain this mathematically.",
  "Explain this like a beginner.",
];
