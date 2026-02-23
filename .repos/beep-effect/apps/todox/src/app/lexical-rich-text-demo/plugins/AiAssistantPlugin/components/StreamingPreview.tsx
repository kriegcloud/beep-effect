"use client";

import { cn } from "@beep/todox/lib/utils";
import { useEffect, useRef } from "react";

interface StreamingPreviewProps {
  readonly content: string;
  readonly isStreaming: boolean;
}

/**
 * Live preview of AI-generated content with auto-scrolling.
 *
 * Features:
 * - Scrollable container for streaming content
 * - Auto-scrolls to bottom as content streams in
 * - Displays "Generating..." indicator with pulsing animation
 * - Shows placeholder when content is empty
 */
export function StreamingPreview({ content, isStreaming }: StreamingPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when content updates during streaming
  useEffect(() => {
    if (isStreaming && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [content, isStreaming]);

  const hasContent = content.length > 0;

  return (
    <div className="flex flex-col gap-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">AI Response</span>
        {isStreaming && (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <span className="animate-pulse">Generating</span>
            <span className="animate-pulse">.</span>
            <span className="animate-pulse" style={{ animationDelay: "150ms" }}>
              .
            </span>
            <span className="animate-pulse" style={{ animationDelay: "300ms" }}>
              .
            </span>
          </span>
        )}
      </div>

      {/* Preview container */}
      <div
        ref={containerRef}
        className={cn(
          "max-h-64 overflow-y-auto rounded-md border bg-muted/50 p-3",
          "scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted-foreground/20"
        )}
      >
        {hasContent ? (
          <pre className="text-sm font-mono whitespace-pre-wrap break-words text-foreground">
            {content}
            {isStreaming && <span className="animate-pulse ml-0.5">|</span>}
          </pre>
        ) : (
          <p className="text-sm text-muted-foreground italic">
            {isStreaming ? "Waiting for response..." : "No content yet"}
          </p>
        )}
      </div>
    </div>
  );
}
