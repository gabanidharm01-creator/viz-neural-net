export type Matrix = number[][];

export interface ConvolutionStep {
  index: number;
  out_row: number;
  out_col: number;
  patch: Matrix;
  kernel: Matrix;
  products: Matrix;
  sum: number;
  output_so_far: (number | null)[][];
}

export interface ConvolutionResult {
  input_shape: [number, number];
  kernel_shape: [number, number];
  stride: number;
  padding: number;
  output_shape: [number, number];
  output: Matrix;
  steps: ConvolutionStep[];
  source: "backend" | "local-preview";
}

export interface PoolingStep {
  index: number;
  out_row: number;
  out_col: number;
  region: Matrix;
  max: number;
  max_position: [number, number];
  output_so_far: (number | null)[][];
}

export interface PoolingResult {
  input_shape: [number, number];
  window: [number, number];
  stride: number;
  output_shape: [number, number];
  output: Matrix;
  steps: PoolingStep[];
  source: "backend" | "local-preview";
}

export interface ReluResult {
  input: Matrix;
  output: Matrix;
  clamped: [number, number][];
  source: "backend" | "local-preview";
}

export interface UNetBlock {
  id: string;
  label: string;
  stage: "input" | "encoder" | "downsample" | "bottleneck" | "upsample" | "decoder" | "output";
  level: number;
  shape: number[];
  description: string;
}

export interface UNetSkip {
  id: string;
  from: string;
  to: string;
  level: number;
  encoder_shape: number[];
  decoder_shape: number[];
  concatenated_shape: number[];
  purpose: string;
}

export interface UNetArchitecture {
  name: string;
  blocks: UNetBlock[];
  skips: UNetSkip[];
  source: "backend" | "local-preview";
}

export interface MetricsResult {
  dice: number;
  iou: number;
  precision: number;
  recall: number;
  tp: number;
  fp: number;
  fn: number;
  tn: number;
  source: "backend" | "local-preview";
}

export interface AiExplainRequest {
  question: string;
  current_module: string;
  current_step: string;
  visualization_state: Record<string, unknown>;
}

export interface AiExplainResponse {
  answer: string;
  source: "backend";
}

export interface NnUNetStage {
  id: string;
  title: string;
  summary: string;
  details: string[];
}
