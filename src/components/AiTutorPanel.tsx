import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Send, Sparkles, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ErrorBanner } from "@/components/SourceBanner";
import { describeApiError, explainWithAI, generateVisualization } from "@/lib/api";
import { SUGGESTED_QUESTIONS, onAskTutor, useVizContext } from "@/lib/tutor";
import { useNavigate } from "@tanstack/react-router";

interface Message {
  id: string;
  role: "user" | "tutor";
  text: string;
}

const MODULE_ROUTES: Record<string, string> = {
  convolution: "/convolution",
  relu: "/relu",
  pooling: "/pooling",
  "cnn-workflow": "/cnn-workflow",
  playground: "/playground",
  unet: "/unet",
  "unet-2d": "/unet-2d",
  "unet-3d": "/unet-3d",
  nnunet: "/nnunet",
  metrics: "/metrics",
};

export function AiTutorPanel() {
  const context = useVizContext();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [vizPrompt, setVizPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<{ title: string; detail: string } | null>(null);
  const contextRef = useRef(context);
  contextRef.current = context;

  const ask = useCallback(async (question: string) => {
    const trimmed = question.trim();
    if (!trimmed) return;
    setError(null);
    setLoading(true);
    setMessages((m) => [...m, { id: crypto.randomUUID(), role: "user", text: trimmed }]);
    try {
      const response = await explainWithAI({
        question: trimmed,
        current_module: contextRef.current.module,
        current_step: contextRef.current.step,
        visualization_state: contextRef.current.state,
      });
      setMessages((m) => [
        ...m,
        { id: crypto.randomUUID(), role: "tutor", text: response.answer },
      ]);
    } catch (err) {
      setError(describeApiError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => onAskTutor((q) => void ask(q)), [ask]);

  const requestVisualization = async () => {
    const trimmed = vizPrompt.trim();
    if (!trimmed) return;
    setError(null);
    setLoading(true);
    try {
      const result = await generateVisualization({
        prompt: trimmed,
        current_module: contextRef.current.module,
      });
      setMessages((m) => [
        ...m,
        { id: crypto.randomUUID(), role: "user", text: trimmed },
        { id: crypto.randomUUID(), role: "tutor", text: result.message },
      ]);
      const route = MODULE_ROUTES[result.module];
      if (route) void navigate({ to: route });
      setVizPrompt("");
    } catch (err) {
      setError(describeApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <aside className="flex h-full min-h-0 flex-col gap-3 border-l border-border bg-sidebar/60 p-4">
      <div className="flex items-center gap-2">
        <Sparkles className="size-4 text-primary" />
        <h2 className="text-sm font-semibold tracking-tight">AI Tutor</h2>
      </div>

      <div className="flex flex-wrap gap-1.5 text-[10px]">
        <Badge variant="outline" className="font-mono">
          module: {context.module}
        </Badge>
        {context.step ? (
          <Badge variant="outline" className="font-mono">
            step: {context.step}
          </Badge>
        ) : null}
      </div>

      <div className="rounded-lg border border-border bg-card/70 p-3">
        <label className="text-xs font-medium text-muted-foreground" htmlFor="viz-prompt">
          What do you want to visualize?
        </label>
        <div className="mt-2 flex gap-2">
          <Input
            id="viz-prompt"
            value={vizPrompt}
            placeholder="Show me a 3×3 edge detector"
            onChange={(e) => setVizPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void requestVisualization();
            }}
          />
          <Button size="icon" variant="secondary" onClick={() => void requestVisualization()}>
            <Wand2 className="size-4" />
          </Button>
        </div>
      </div>

      <ScrollArea className="min-h-0 flex-1 rounded-lg border border-border bg-card/40">
        <div className="space-y-3 p-3">
          {messages.length === 0 && !error ? (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                Ask about anything on screen. Questions are answered by the backend AI endpoint
                using your current visualization state.
              </p>
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => void ask(q)}
                  className="block w-full rounded-md border border-border bg-secondary/40 px-2.5 py-1.5 text-left text-xs transition-colors hover:border-primary hover:bg-secondary"
                >
                  {q}
                </button>
              ))}
            </div>
          ) : null}

          {messages.map((m) => (
            <div
              key={m.id}
              className={
                m.role === "user"
                  ? "ml-6 rounded-lg bg-primary/15 px-3 py-2 text-xs"
                  : "mr-2 rounded-lg border border-border bg-card px-3 py-2 text-xs leading-relaxed whitespace-pre-wrap"
              }
            >
              {m.text}
            </div>
          ))}

          {loading ? (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="size-3.5 animate-spin" /> Thinking…
            </div>
          ) : null}

          {error ? <ErrorBanner title={error.title} detail={error.detail} /> : null}
        </div>
      </ScrollArea>

      <div className="flex gap-2">
        <Input
          value={input}
          placeholder="Ask the tutor…"
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              void ask(input);
              setInput("");
            }
          }}
        />
        <Button
          size="icon"
          onClick={() => {
            void ask(input);
            setInput("");
          }}
          disabled={loading}
        >
          <Send className="size-4" />
        </Button>
      </div>
    </aside>
  );
}
