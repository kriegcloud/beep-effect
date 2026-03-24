import type { ChatResponse, MessageSegment } from "@repo/domain/Chat";
import { AlertCircle, CheckCircle, Loader2, Wrench } from "lucide-react";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "../../lib/utils";

export function ToolCall({
  segment,
}: {
  segment: MessageSegment & { _tag: "tool-call" };
}) {
  const statusStyles = {
    executing: {
      icon: "text-muted-foreground",
      badge: "border-border bg-muted text-muted-foreground",
      label: "Executing",
    },
    complete: {
      icon: "text-primary",
      badge: "border-primary/30 bg-primary/10 text-primary",
      label: "Complete",
    },
    failed: {
      icon: "text-destructive",
      badge: "border-destructive/40 bg-destructive/10 text-destructive",
      label: "Failed",
    },
    proposed: {
      icon: "text-secondary-foreground",
      badge: "border-border bg-secondary text-secondary-foreground",
      label: "Proposed",
    },
  } as const;
  const styles = statusStyles[segment.tool.status];

  return (
    <div className="max-w-full flex items-center gap-2 text-xs px-3 py-2 rounded-none bg-muted/50 border border-border flex-wrap">
      {segment.tool.status === "executing" && (
        <Loader2 className={`h-3 w-3 animate-spin ${styles.icon}`} />
      )}
      {segment.tool.status === "complete" && (
        <CheckCircle className={`h-3 w-3 ${styles.icon}`} />
      )}
      {segment.tool.status === "failed" && (
        <AlertCircle className={`h-3 w-3 ${styles.icon}`} />
      )}
      {segment.tool.status === "proposed" && (
        <Wrench className={`h-3 w-3 ${styles.icon}`} />
      )}
      <span
        className={cn(
          "text-[0.6rem] uppercase tracking-[0.2em] border rounded-none px-1.5 py-0.5",
          styles.badge,
        )}
      >
        {styles.label}
      </span>
      <span className="font-mono font-medium">{segment.tool.name}</span>
      {segment.tool.result && segment.tool.status === "complete" && (
        <span className="text-muted-foreground flex-1 truncate overflow-hidden break-all">
          &rarr;{" "}
          {segment.tool.result.length > 100
            ? `${segment.tool.result.slice(0, 100)}...`
            : segment.tool.result}
        </span>
      )}
    </div>
  );
}

export function TokenUsage({
  response,
}: {
  response: Pick<ChatResponse & { _tag: "complete" }, "usage" | "finishReason">;
}) {
  if (!response.usage) return null;
  return (
    <div className="flex gap-2 text-xs text-muted-foreground px-1">
      <span className="flex items-center gap-1">
        <span className="font-mono">{response.usage.totalTokens} tokens</span>
        <span className="text-muted-foreground/60">
          ({response.usage.promptTokens}&uarr; {response.usage.completionTokens}
          &darr;)
        </span>
      </span>
      <span className="text-muted-foreground/60">
        &bull; {response.finishReason}
      </span>
    </div>
  );
}

export function Segment({
  className,
  children,
  ...props
}: ComponentPropsWithoutRef<"div">) {
  return (
    <div
      className={cn("flex flex-col gap-1 items-start w-full", className)}
      {...props}
    >
      {children}
    </div>
  );
}
