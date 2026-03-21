import { useAtom } from "@effect/atom-react";
import type { ChatResponse, MessageSegment } from "@repo/domain/Chat";
import { AsyncResult } from "effect/unstable/reactivity";
import { AlertCircle, Loader2, Send } from "lucide-react";
import { type FC, useEffect, useMemo, useRef, useState } from "react";
import { chatAtom } from "@/lib/atoms/chat-atom";
import { cn } from "@/lib/utils";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Input } from "./ui/input";
import { Markdown } from "./ui/markdown";
import { Segment, TokenUsage, ToolCall } from "./ui/segment";

type Message = {
  role: "user" | "assistant" | "system";
  message: string;
  segments?: readonly MessageSegment[];
  usage?:
    | {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
      }
    | undefined;
  finishReason?: string | undefined;
};

export function ChatBox() {
  const [result, runChat] = useAtom(chatAtom);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<Message[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const lastSentMessagesRef = useRef<
    Array<{
      role: "user" | "assistant" | "system";
      content: string;
    }>
  >([]);
  const readinessAttemptRef = useRef(0);
  const lastCompletionKeyRef = useRef<string | null>(null);

  const currentResult: ChatResponse = AsyncResult.getOrElse(
    result,
    () => ({ _tag: "initial" }) as const,
  );

  const currentSegments =
    currentResult._tag === "initial" ? [] : currentResult.segments;

  const isWaiting = AsyncResult.isWaiting(result);
  const isFailure = AsyncResult.isFailure(result);
  const isStreaming = currentResult._tag === "streaming";
  const sendMessages = (
    messages: Array<{
      role: "user" | "assistant" | "system";
      content: string;
    }>,
  ) => {
    lastSentMessagesRef.current = messages;
    readinessAttemptRef.current = 0;
    runChat(messages);
  };

  useEffect(() => {
    if (!isFailure) return;
    if (currentResult._tag !== "error" || !currentResult.error.recoverable) {
      return;
    }
    if (lastSentMessagesRef.current.length === 0) return;
    if (readinessAttemptRef.current >= 3) return;

    readinessAttemptRef.current += 1;
    const timeoutId = window.setTimeout(() => {
      runChat(lastSentMessagesRef.current);
    }, 600 * readinessAttemptRef.current);

    return () => window.clearTimeout(timeoutId);
  }, [currentResult, isFailure, runChat]);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg: Message = { role: "user", message: input };
    setHistory((prev) => [...prev, userMsg]);
    setInput("");

    const messages = historyToMessages([...history, userMsg]);
    sendMessages(messages);
  };

  const currentIteration =
    currentResult._tag === "streaming" ? currentResult.currentIteration : null;

  const streamingMessage = useMemo<Message | null>(() => {
    if (currentResult._tag !== "streaming") return null;
    if (currentSegments.length === 0) return null;
    return {
      role: "assistant",
      message: "",
      segments: currentSegments,
    };
  }, [currentResult._tag, currentSegments]);

  const displayHistory = useMemo(() => {
    if (!streamingMessage) return history;
    return [...history, streamingMessage];
  }, [history, streamingMessage]);

  const scrollTrigger = useMemo(
    () => `${displayHistory.length}-${currentSegments.length}`,
    [displayHistory.length, currentSegments.length],
  );

  const completionSnapshot = useMemo(() => {
    if (currentResult._tag !== "complete") return null;
    if (currentResult.segments.length === 0) return null;
    return {
      segments: currentResult.segments,
      usage: currentResult.usage,
      finishReason: currentResult.finishReason,
    };
  }, [currentResult]);

  useEffect(() => {
    if (!completionSnapshot) return;
    const completionKey = JSON.stringify(completionSnapshot);
    if (lastCompletionKeyRef.current === completionKey) return;
    lastCompletionKeyRef.current = completionKey;
    setHistory((prev) => [
      ...prev,
      {
        role: "assistant",
        message: "",
        segments: completionSnapshot.segments,
        usage: completionSnapshot.usage,
        finishReason: completionSnapshot.finishReason,
      },
    ]);
  }, [completionSnapshot]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: scrollTrigger is stable string
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    container.scrollTo({
      top: container.scrollHeight,
      behavior: isStreaming ? "auto" : "smooth",
    });
  }, [scrollTrigger]);

  return (
    <Card className="h-full w-full">
      <CardHeader className="border-b border-border">
        <CardTitle>Chat (RPC)</CardTitle>
        <CardAction>
          <div className="flex gap-2">
            {isStreaming && (
              <Badge
                variant="outline"
                className="border-border bg-secondary text-[0.65rem] uppercase tracking-[0.2em] text-secondary-foreground"
              >
                <Loader2 className="h-3 w-3 animate-spin" />
                Streaming
              </Badge>
            )}
            {isWaiting && !isStreaming && (
              <Badge
                variant="outline"
                className="border-border bg-muted text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground"
              >
                <Loader2 className="h-3 w-3 animate-spin" />
                Loading
              </Badge>
            )}
            {isFailure && (
              <Badge
                variant="destructive"
                className="text-[0.65rem] uppercase tracking-[0.2em]"
              >
                <AlertCircle className="h-3 w-3" />
                Error
              </Badge>
            )}
            {currentIteration !== null && (
              <Badge
                variant="outline"
                className="border-border bg-secondary text-[0.65rem] uppercase tracking-[0.2em] text-secondary-foreground"
              >
                Iteration {currentIteration}
              </Badge>
            )}
          </div>
        </CardAction>
      </CardHeader>

      <CardContent className="flex-1 min-h-0 overflow-y-auto px-4">
        <div className="space-y-6 py-6" ref={scrollContainerRef}>
          {/* Empty state */}
          {displayHistory.length === 0 && currentSegments.length === 0 && (
            <div className="flex flex-col items-start gap-2 rounded-none border border-border bg-muted/50 px-4 py-6 text-xs text-muted-foreground">
              <p className="text-[0.65rem] uppercase tracking-[0.28em]">
                Empty channel
              </p>
              <p className="text-xs text-foreground">
                Start with a clear request.
              </p>
            </div>
          )}

          {/* History messages */}
          {displayHistory.map((msg, i) => (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: stable order in append-only history
              key={i}
              className={cn(
                "flex w-full flex-col gap-2",
                msg.role === "user" ? "items-end mb-8" : "items-start",
              )}
            >
              {msg.role === "user" ? (
                <div className="max-w-[85%] rounded-none border border-primary/40 bg-primary px-4 py-2 text-xs text-primary-foreground shadow-xs whitespace-break-spaces">
                  {msg.message}
                </div>
              ) : (
                <>
                  {msg.segments?.map((segment, segIdx) => (
                    <Segment
                      // biome-ignore lint/suspicious/noArrayIndexKey: stable order
                      key={segIdx}
                    >
                      {segment._tag === "text" ? (
                        <div className="w-full py-2 text-xs">
                          <Markdown content={segment.content} />
                        </div>
                      ) : (
                        <ToolCall segment={segment} />
                      )}
                    </Segment>
                  ))}
                  {msg.usage && msg.finishReason && (
                    <TokenUsage
                      response={{
                        usage: msg.usage,
                        finishReason: msg.finishReason,
                      }}
                    />
                  )}
                </>
              )}
            </div>
          ))}

          {/* Thinking message */}
          {currentResult._tag === "streaming" && currentResult.thinking && (
            <div className="flex w-full flex-col gap-2 items-start">
              <div className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-2.5 py-0.5 text-[0.65rem] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                Thinking: {currentResult.thinking}
              </div>
            </div>
          )}

          {/* Error display from stream */}
          {currentResult._tag === "error" && (
            <div className="text-destructive text-xs p-3 border border-destructive/40 bg-destructive/10 rounded-none">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-foreground">
                    {currentResult.error.message}
                  </p>
                  {currentResult.error.recoverable && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const messages = historyToMessages(history);
                        sendMessages(messages);
                      }}
                      className="mt-2"
                    >
                      Retry
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* RPC failure display */}
          {isFailure && <ErrorDisplay result={result} />}

          {/* Scroll anchor */}
        </div>
      </CardContent>

      <CardFooter className="border-t border-border">
        <div className="flex w-full gap-2">
          <Input
            type="text"
            placeholder="Send a message"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            disabled={isWaiting || isStreaming}
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!input.trim() || isWaiting || isStreaming}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

const historyToMessages = (messages: Message[]) =>
  messages.map((msg) => {
    if (msg.role === "assistant" && msg.segments) {
      const textContent = msg.segments
        .filter((seg) => seg._tag === "text")
        .map((seg) => seg.content)
        .join("");
      return {
        role: msg.role,
        content: textContent || msg.message,
      };
    }
    return {
      role: msg.role,
      content: msg.message,
    };
  });

const ErrorDisplay: FC<{
  result: AsyncResult.Failure<unknown, unknown>;
}> = ({ result }) => {
  return (
    <div className="flex w-full justify-center">
      <div className="text-destructive text-xs flex flex-col items-center gap-2 max-w-[80%]">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          Failed to get response
        </div>
        <div className="text-xs text-muted-foreground">
          Check browser console for detailed error information
        </div>
        <details className="text-xs font-mono w-full">
          <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
            Show technical details
          </summary>
          <div className="mt-2 p-2 bg-muted rounded-none text-left overflow-auto max-h-40">
            <pre className="whitespace-pre-wrap break-words">
              {JSON.stringify(result.cause, null, 2)}
            </pre>
          </div>
        </details>
      </div>
    </div>
  );
};
