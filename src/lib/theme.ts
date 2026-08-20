import { useCallback, useSyncExternalStore } from "react";

export type Theme = "dark" | "light";

const STORAGE_KEY = "neurovision.theme";

let theme: Theme = "dark";
let hydrated = false;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

function apply(next: Theme) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("light", next === "light");
  document.documentElement.style.colorScheme = next;
}

function subscribe(listener: () => void) {
  if (!hydrated && typeof window !== "undefined") {
    hydrated = true;
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY) as Theme | null;
      const next: Theme =
        stored ??
        (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
      if (next !== theme) {
        theme = next;
        queueMicrotask(emit);
      }
      apply(next);
    } catch {
      /* ignore */
    }
  }
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const getSnapshot = () => theme;
const getServerSnapshot = (): Theme => "dark";

export function useTheme() {
  const value = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setTheme = useCallback((next: Theme) => {
    theme = next;
    apply(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
    emit();
  }, []);

  const toggle = useCallback(() => setTheme(theme === "dark" ? "light" : "dark"), [setTheme]);

  return { theme: value, setTheme, toggle };
}
