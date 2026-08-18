import type { Matrix } from "./types";

/**
 * Synthetic teaching data (clearly labelled in the UI as demo data).
 * These are deterministic geometric phantoms — never model output.
 */
export function syntheticMri(size = 32): { image: Matrix; groundTruth: Matrix; prediction: Matrix } {
  const image: Matrix = [];
  const groundTruth: Matrix = [];
  const prediction: Matrix = [];
  const c = size / 2;

  for (let y = 0; y < size; y++) {
    const imgRow: number[] = [];
    const gtRow: number[] = [];
    const predRow: number[] = [];
    for (let x = 0; x < size; x++) {
      const head = Math.hypot(x - c + 0.5, (y - c + 0.5) * 1.1);
      const lesion = Math.hypot(x - c * 1.35, y - c * 0.8);
      const lesionPred = Math.hypot(x - c * 1.3, y - c * 0.85);
      let v = 0.03;
      if (head < c - 1) v = 0.36 + 0.08 * Math.sin(x * 0.7) * Math.cos(y * 0.6);
      if (head < c - 4) v = 0.58 + 0.07 * Math.sin((x + y) * 0.5);
      const isLesion = lesion < 4;
      if (isLesion) v = 0.92;
      imgRow.push(Math.round(Math.max(0, Math.min(1, v)) * 100) / 100);
      gtRow.push(isLesion ? 1 : 0);
      predRow.push(lesionPred < 3.6 ? 1 : 0);
    }
    image.push(imgRow);
    groundTruth.push(gtRow);
    prediction.push(predRow);
  }

  return { image, groundTruth, prediction };
}
