import { useEffect, useState } from "react";
import { ApiError, describeApiError } from "@/lib/api";

export interface ComputationState<T> {
  data: T | null;
  loading: boolean;
  error: { title: string; detail: string } | null;
  usingPreview: boolean;
}

/**
 * Requests a computation from the FastAPI backend. If the backend is not
 * configured or unreachable, an explicitly-labelled local preview is used so
 * the lesson stays usable — the caller always renders a banner for it.
 * Backend rejections (invalid input, processing failures) are surfaced as
 * errors and never masked by the preview.
 */
export function useComputation<T>(
  remote: () => Promise<T>,
  preview: () => T,
  deps: unknown[],
): ComputationState<T> {
  const [state, setState] = useState<ComputationState<T>>({
    data: null,
    loading: true,
    error: null,
    usingPreview: false,
  });

  useEffect(() => {
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: null }));

    remote()
      .then((data) => {
        if (!cancelled) setState({ data, loading: false, error: null, usingPreview: false });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        const offline =
          error instanceof ApiError && (error.kind === "not-configured" || error.kind === "unavailable");
        if (offline) {
          setState({ data: preview(), loading: false, error: null, usingPreview: true });
        } else {
          setState({ data: null, loading: false, error: describeApiError(error), usingPreview: false });
        }
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return state;
}
