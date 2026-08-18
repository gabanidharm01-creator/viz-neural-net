import { useCallback, useSyncExternalStore } from "react";
import type { Matrix } from "./types";

export const DEFAULT_IMAGE: Matrix = [
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 1, 1, 0, 0, 0, 0],
  [0, 1, 1, 1, 1, 0, 0, 0],
  [0, 0, 1, 1, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
];

export const KERNELS: Record<string, { label: string; kernel: Matrix; note: string }> = {
  "edge-vertical": {
    label: "Vertical edge (Sobel-x)",
    kernel: [
      [-1, 0, 1],
      [-2, 0, 2],
      [-1, 0, 1],
    ],
    note: "Responds to left-right intensity changes.",
  },
  "edge-horizontal": {
    label: "Horizontal edge (Sobel-y)",
    kernel: [
      [-1, -2, -1],
      [0, 0, 0],
      [1, 2, 1],
    ],
    note: "Responds to top-bottom intensity changes.",
  },
  laplacian: {
    label: "Laplacian",
    kernel: [
      [0, -1, 0],
      [-1, 4, -1],
      [0, -1, 0],
    ],
    note: "Second-derivative operator: isolates blobs and outlines.",
  },
  sharpen: {
    label: "Sharpen",
    kernel: [
      [0, -1, 0],
      [-1, 5, -1],
      [0, -1, 0],
    ],
    note: "Boosts the center pixel relative to its neighbours.",
  },
  blur: {
    label: "Box blur (1/9)",
    kernel: [
      [0.111, 0.111, 0.111],
      [0.111, 0.111, 0.111],
      [0.111, 0.111, 0.111],
    ],
    note: "Averages the 3×3 neighbourhood.",
  },
  identity: {
    label: "Identity",
    kernel: [
      [0, 0, 0],
      [0, 1, 0],
      [0, 0, 0],
    ],
    note: "Passes the center pixel through unchanged.",
  },
};

const STORAGE_KEY = "neurovision.image";

type State = { image: Matrix; kernelId: string };

let state: State = { image: DEFAULT_IMAGE.map((r) => [...r]), kernelId: "edge-vertical" };
let hydrated = false;
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as State;
      if (Array.isArray(parsed.image) && parsed.image.length > 0) {
        state = { image: parsed.image, kernelId: parsed.kernelId ?? "edge-vertical" };
        emit();
      }
    }
  } catch {
    /* corrupted storage is ignored — defaults stay */
  }
}

function persist() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* storage full or blocked */
  }
}

function subscribe(listener: () => void) {
  hydrate();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const getSnapshot = () => state;
const getServerSnapshot = () => state;

export function useLabImage() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setPixel = useCallback((row: number, col: number, value: number) => {
    const image = snapshotImage().map((r, ri) =>
      r.map((v, ci) => (ri === row && ci === col ? value : v)),
    );
    state = { ...state, image };
    persist();
    emit();
  }, []);

  const setImage = useCallback((image: Matrix) => {
    state = { ...state, image };
    persist();
    emit();
  }, []);

  const setKernelId = useCallback((kernelId: string) => {
    state = { ...state, kernelId };
    persist();
    emit();
  }, []);

  const clear = useCallback(() => {
    setImage(snapshotImage().map((r) => r.map(() => 0)));
  }, [setImage]);

  const reset = useCallback(() => {
    setImage(DEFAULT_IMAGE.map((r) => [...r]));
  }, [setImage]);

  return {
    image: snapshot.image,
    kernelId: snapshot.kernelId,
    kernel: KERNELS[snapshot.kernelId]?.kernel ?? KERNELS["edge-vertical"]!.kernel,
    setPixel,
    setImage,
    setKernelId,
    clear,
    reset,
  };
}

function snapshotImage() {
  return state.image;
}
