/**
 * Centralized API client for the NeuroVision Lab FastAPI backend.
 *
 * The base URL comes from VITE_API_URL. Never hardcode a host in components.
 * Every scientific computation is requested from the backend. When the backend
 * is unreachable, callers may opt into an explicitly labelled local preview
 * (see src/lib/localPreview.ts) — never silently, and never presented as a
 * backend result.
 */

import type {
  AiExplainRequest,
  AiExplainResponse,
  ConvolutionResult,
  Matrix,
  MetricsResult,
  PoolingResult,
  ReluResult,
  UNetArchitecture,
} from "./types";

export const API_BASE_URL: string =
  (import.meta.env["VITE_API_URL"] as string | undefined)?.replace(/\/$/, "") ?? "";

export type ApiErrorKind =
  | "not-configured"
  | "unavailable"
  | "invalid-input"
  | "processing-failed"
  | "llm-unavailable"
  | "unknown";

export class ApiError extends Error {
  kind: ApiErrorKind;
  status?: number | undefined;

  constructor(kind: ApiErrorKind, message: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.kind = kind;
    this.status = status;
  }
}

export function describeApiError(error: unknown): { title: string; detail: string } {
  if (error instanceof ApiError) {
    switch (error.kind) {
      case "not-configured":
        return {
          title: "Backend not configured",
          detail:
            "Set VITE_API_URL to the FastAPI backend that performs the scientific computation.",
        };
      case "unavailable":
        return {
          title: "Backend unavailable",
          detail: `Could not reach ${API_BASE_URL || "the API"}. ${error.message}`,
        };
      case "invalid-input":
        return { title: "Invalid input", detail: error.message };
      case "llm-unavailable":
        return { title: "AI tutor unavailable", detail: error.message };
      case "processing-failed":
        return { title: "Model processing failed", detail: error.message };
      default:
        return { title: "Request failed", detail: error.message };
    }
  }
  return { title: "Unexpected error", detail: error instanceof Error ? error.message : String(error) };
}

async function request<T>(path: string, body?: unknown, method: "GET" | "POST" = "POST"): Promise<T> {
  if (!API_BASE_URL) {
    throw new ApiError("not-configured", "VITE_API_URL is not set.");
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: { "Content-Type": "application/json" },
      ...(body !== undefined && method !== "GET" ? { body: JSON.stringify(body) } : {}),
    });
  } catch (error) {
    throw new ApiError("unavailable", error instanceof Error ? error.message : "Network error");
  }

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    const detail = text.slice(0, 400) || response.statusText;
    if (response.status === 400 || response.status === 422) {
      throw new ApiError("invalid-input", detail, response.status);
    }
    if (response.status === 503) {
      throw new ApiError("llm-unavailable", detail, response.status);
    }
    if (response.status >= 500) {
      throw new ApiError("processing-failed", detail, response.status);
    }
    throw new ApiError("unknown", detail, response.status);
  }

  try {
    return (await response.json()) as T;
  } catch {
    throw new ApiError("processing-failed", "Backend returned a malformed response.");
  }
}

export interface ConvolutionParams {
  image: Matrix;
  kernel: Matrix;
  stride: number;
  padding: number;
}

export const calculateConvolution = (params: ConvolutionParams) =>
  request<ConvolutionResult>("/cnn/convolution", params);

export const calculateRelu = (image: Matrix) => request<ReluResult>("/cnn/relu", { image });

export interface PoolingParams {
  image: Matrix;
  window: [number, number];
  stride: number;
}

export const calculatePooling = (params: PoolingParams) =>
  request<PoolingResult>("/cnn/max-pooling", params);

export const getUnetArchitecture = (params: {
  input_size: number;
  base_features: number;
  depth: number;
  num_classes: number;
  dimensions: 2 | 3;
}) => request<UNetArchitecture>("/unet/architecture", params);

export const calculateMetrics = (params: { ground_truth: Matrix; prediction: Matrix }) =>
  request<MetricsResult>("/metrics/segmentation", params);

export const getNnUNetWorkflow = () => request<unknown>("/nnunet/workflow", undefined, "GET");

export const getNnUNetPlans = (fingerprint: Record<string, unknown>) =>
  request<unknown>("/nnunet/plans", fingerprint);

export const inspectModel = (params: Record<string, unknown>) =>
  request<unknown>("/model/inspect", params);

export const explainWithAI = (params: AiExplainRequest) =>
  request<AiExplainResponse>("/ai/explain", params);

export const generateVisualization = (params: {
  prompt: string;
  current_module: string;
}) => request<{ module: string; message: string }>("/ai/generate-visualization", params);
