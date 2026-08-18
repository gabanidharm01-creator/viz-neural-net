/**
 * Local preview mode.
 *
 * These are exact, transparent implementations of the *definitions* of the
 * classroom operations (sliding-window dot product, ReLU, max pooling, the
 * standard textbook U-Net shape schedule and the standard segmentation metric
 * formulas). They exist ONLY so the teaching UI stays usable when the FastAPI
 * backend is not reachable, and every result produced here is labelled
 * `source: "local-preview"` and rendered with a visible banner.
 *
 * No model weights, no inference, no invented nnU-Net configuration ever comes
 * from this file — those always require the backend.
 */

import type {
  ConvolutionResult,
  ConvolutionStep,
  Matrix,
  MetricsResult,
  PoolingResult,
  PoolingStep,
  ReluResult,
  UNetArchitecture,
  UNetBlock,
  UNetSkip,
} from "./types";

const round = (n: number) => Math.round(n * 1000) / 1000;

function pad(image: Matrix, padding: number): Matrix {
  if (padding <= 0) return image;
  const width = image[0].length + padding * 2;
  const row = () => Array.from({ length: width }, () => 0);
  return [
    ...Array.from({ length: padding }, row),
    ...image.map((r) => [...Array(padding).fill(0), ...r, ...Array(padding).fill(0)]),
    ...Array.from({ length: padding }, row),
  ];
}

export function localConvolution(
  image: Matrix,
  kernel: Matrix,
  stride: number,
  padding: number,
): ConvolutionResult {
  const padded = pad(image, padding);
  const kh = kernel.length;
  const kw = kernel[0].length;
  const outH = Math.floor((padded.length - kh) / stride) + 1;
  const outW = Math.floor((padded[0].length - kw) / stride) + 1;

  const output: Matrix = Array.from({ length: outH }, () => Array(outW).fill(0));
  const running: (number | null)[][] = Array.from({ length: outH }, () => Array(outW).fill(null));
  const steps: ConvolutionStep[] = [];

  let index = 0;
  for (let r = 0; r < outH; r++) {
    for (let c = 0; c < outW; c++) {
      const patch: Matrix = [];
      const products: Matrix = [];
      let sum = 0;
      for (let i = 0; i < kh; i++) {
        const patchRow: number[] = [];
        const productRow: number[] = [];
        for (let j = 0; j < kw; j++) {
          const v = padded[r * stride + i][c * stride + j];
          const p = v * kernel[i][j];
          patchRow.push(v);
          productRow.push(round(p));
          sum += p;
        }
        patch.push(patchRow);
        products.push(productRow);
      }
      output[r][c] = round(sum);
      running[r][c] = round(sum);
      steps.push({
        index: index++,
        out_row: r,
        out_col: c,
        patch,
        kernel,
        products,
        sum: round(sum),
        output_so_far: running.map((row) => [...row]),
      });
    }
  }

  return {
    input_shape: [image.length, image[0].length],
    kernel_shape: [kh, kw],
    stride,
    padding,
    output_shape: [outH, outW],
    output,
    steps,
    source: "local-preview",
  };
}

export function localRelu(image: Matrix): ReluResult {
  const clamped: [number, number][] = [];
  const output = image.map((row, r) =>
    row.map((v, c) => {
      if (v < 0) clamped.push([r, c]);
      return Math.max(0, v);
    }),
  );
  return { input: image, output, clamped, source: "local-preview" };
}

export function localMaxPooling(image: Matrix, window: [number, number], stride: number): PoolingResult {
  const [wh, ww] = window;
  const outH = Math.floor((image.length - wh) / stride) + 1;
  const outW = Math.floor((image[0].length - ww) / stride) + 1;
  const output: Matrix = Array.from({ length: outH }, () => Array(outW).fill(0));
  const running: (number | null)[][] = Array.from({ length: outH }, () => Array(outW).fill(null));
  const steps: PoolingStep[] = [];

  let index = 0;
  for (let r = 0; r < outH; r++) {
    for (let c = 0; c < outW; c++) {
      const region: Matrix = [];
      let max = -Infinity;
      let maxPos: [number, number] = [0, 0];
      for (let i = 0; i < wh; i++) {
        const regionRow: number[] = [];
        for (let j = 0; j < ww; j++) {
          const v = image[r * stride + i][c * stride + j];
          regionRow.push(v);
          if (v > max) {
            max = v;
            maxPos = [i, j];
          }
        }
        region.push(regionRow);
      }
      output[r][c] = round(max);
      running[r][c] = round(max);
      steps.push({
        index: index++,
        out_row: r,
        out_col: c,
        region,
        max: round(max),
        max_position: maxPos,
        output_so_far: running.map((row) => [...row]),
      });
    }
  }

  return {
    input_shape: [image.length, image[0].length],
    window,
    stride,
    output_shape: [outH, outW],
    output,
    steps,
    source: "local-preview",
  };
}

export function localUNetArchitecture(opts: {
  inputSize: number;
  baseFeatures: number;
  depth: number;
  numClasses: number;
  dimensions: 2 | 3;
}): UNetArchitecture {
  const { inputSize, baseFeatures, depth, numClasses, dimensions } = opts;
  const spatial = (size: number) => Array.from({ length: dimensions }, () => size);
  const blocks: UNetBlock[] = [];
  const skips: UNetSkip[] = [];

  blocks.push({
    id: "input",
    label: "Input",
    stage: "input",
    level: 0,
    shape: [...spatial(inputSize), 1],
    description: "Raw image tensor entering the network.",
  });

  let size = inputSize;
  let features = baseFeatures;
  const encoderShapes: { id: string; shape: number[]; level: number }[] = [];

  for (let level = 0; level < depth; level++) {
    const encId = `enc-${level}`;
    blocks.push({
      id: encId,
      label: `Encoder ${level + 1}`,
      stage: "encoder",
      level,
      shape: [...spatial(size), features],
      description: `Two ${dimensions}D convolutions + activation extracting features at this resolution.`,
    });
    encoderShapes.push({ id: encId, shape: [...spatial(size), features], level });

    size = Math.floor(size / 2);
    features *= 2;
    blocks.push({
      id: `down-${level}`,
      label: `Downsample ${level + 1}`,
      stage: "downsample",
      level,
      shape: [...spatial(size), features / 2],
      description: "Strided pooling halves each spatial dimension, widening the receptive field.",
    });
  }

  blocks.push({
    id: "bottleneck",
    label: "Bottleneck",
    stage: "bottleneck",
    level: depth,
    shape: [...spatial(size), features],
    description: "Lowest resolution, richest semantic representation. No skip enters here.",
  });

  for (let level = depth - 1; level >= 0; level--) {
    size *= 2;
    features = Math.floor(features / 2);
    blocks.push({
      id: `up-${level}`,
      label: `Upsample ${level + 1}`,
      stage: "upsample",
      level,
      shape: [...spatial(size), features],
      description: "Transposed convolution doubles each spatial dimension.",
    });
    const encoder = encoderShapes.find((e) => e.level === level)!;
    const decId = `dec-${level}`;
    blocks.push({
      id: decId,
      label: `Decoder ${level + 1}`,
      stage: "decoder",
      level,
      shape: [...spatial(size), features],
      description: "Convolutions applied after concatenating the matching encoder features.",
    });
    const decoderShape = [...spatial(size), features];
    skips.push({
      id: `skip-${level}`,
      from: encoder.id,
      to: decId,
      level,
      encoder_shape: encoder.shape,
      decoder_shape: decoderShape,
      concatenated_shape: [...spatial(size), encoder.shape[dimensions] + features],
      purpose:
        "Restores the high-frequency spatial detail lost during downsampling by concatenating the encoder feature map onto the upsampled decoder feature map along the channel axis.",
    });
  }

  blocks.push({
    id: "output",
    label: "Segmentation Mask",
    stage: "output",
    level: 0,
    shape: [...spatial(inputSize), numClasses],
    description: "1×1 convolution mapping features to per-class logits, one channel per class.",
  });

  return { name: `${dimensions}D U-Net`, blocks, skips, source: "local-preview" };
}

export function localMetrics(groundTruth: Matrix, prediction: Matrix): MetricsResult {
  let tp = 0;
  let fp = 0;
  let fn = 0;
  let tn = 0;
  for (let r = 0; r < groundTruth.length; r++) {
    for (let c = 0; c < groundTruth[r].length; c++) {
      const g = groundTruth[r][c] > 0.5 ? 1 : 0;
      const p = prediction[r][c] > 0.5 ? 1 : 0;
      if (g === 1 && p === 1) tp++;
      else if (g === 0 && p === 1) fp++;
      else if (g === 1 && p === 0) fn++;
      else tn++;
    }
  }
  const safe = (num: number, den: number) => (den === 0 ? 0 : num / den);
  return {
    dice: round(safe(2 * tp, 2 * tp + fp + fn)),
    iou: round(safe(tp, tp + fp + fn)),
    precision: round(safe(tp, tp + fp)),
    recall: round(safe(tp, tp + fn)),
    tp,
    fp,
    fn,
    tn,
    source: "local-preview",
  };
}
