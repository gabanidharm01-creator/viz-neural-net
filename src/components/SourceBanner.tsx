import { AlertTriangle, CloudOff, ServerCog } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { API_BASE_URL } from "@/lib/api";

export function PreviewBanner({ what }: { what: string }) {
  return (
    <Alert className="border-skip/40 bg-skip/10">
      <CloudOff className="size-4" />
      <AlertTitle>Local preview — backend not connected</AlertTitle>
      <AlertDescription>
        {API_BASE_URL
          ? `Could not reach ${API_BASE_URL}.`
          : "VITE_API_URL is not set."}{" "}
        {what} is being computed in the browser from the textbook definition so the lesson stays
        usable. Connect the FastAPI backend for authoritative results.
      </AlertDescription>
    </Alert>
  );
}

export function ErrorBanner({ title, detail }: { title: string; detail: string }) {
  return (
    <Alert variant="destructive">
      <AlertTriangle className="size-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="break-words">{detail}</AlertDescription>
    </Alert>
  );
}

export function BackendRequiredBanner({ feature }: { feature: string }) {
  return (
    <Alert className="border-accent/40 bg-accent/10">
      <ServerCog className="size-4" />
      <AlertTitle>Backend required</AlertTitle>
      <AlertDescription>
        {feature} is produced by the FastAPI backend — the frontend never invents these values.
        {API_BASE_URL ? ` Configured endpoint: ${API_BASE_URL}` : " Set VITE_API_URL to enable it."}
      </AlertDescription>
    </Alert>
  );
}
