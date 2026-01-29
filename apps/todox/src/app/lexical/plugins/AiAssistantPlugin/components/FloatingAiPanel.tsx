"use client";

import { cn } from "@beep/todox/lib/utils";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { useAiContext } from "../../../context/AiContext";
import { INSERT_AI_TEXT_COMMAND } from "../commands";
import { useAiStreaming } from "../hooks/useAiStreaming";
import { AiCommandMenu } from "./AiCommandMenu";
import { InsertionModeSelector } from "./InsertionModeSelector";
import { StreamingPreview } from "./StreamingPreview";

interface FloatingAiPanelProps {
  readonly anchorElem?: HTMLElement;
}

interface PanelPosition {
  readonly top: number;
  readonly left: number;
}

/**
 * Floating container positioned near text selection that orchestrates the AI interaction flow.
 *
 * State machine:
 * 1. idle -> Show command menu for prompt selection
 * 2. streaming -> Show preview with stop button
 * 3. complete -> Show preview with insert/cancel buttons
 * 4. error -> Show error message with retry button
 */
export function FloatingAiPanel({ anchorElem }: FloatingAiPanelProps) {
  const [editor] = useLexicalComposerContext();

  const { isAiPanelOpen, setAiPanelOpen, selectedText, insertionMode, setInsertionMode } = useAiContext();

  const { streamedContent, operationState, error, streamResponse, abort, reset: resetStreaming } = useAiStreaming();

  const [position, setPosition] = useState<PanelPosition>({ top: 0, left: 0 });
  const [lastInstruction, setLastInstruction] = useState<string>("");

  // Calculate position based on selection
  useEffect(() => {
    if (!isAiPanelOpen) return;

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    setPosition({
      top: rect.bottom + window.scrollY + 8,
      left: rect.left + window.scrollX,
    });
  }, [isAiPanelOpen, selectedText]);

  const handlePromptSelect = useCallback(
    (_promptId: string, instruction: string) => {
      setLastInstruction(instruction);
      void streamResponse(selectedText, instruction);
    },
    [selectedText, streamResponse]
  );

  const handleInsert = useCallback(() => {
    if (!streamedContent) return;

    editor.dispatchCommand(INSERT_AI_TEXT_COMMAND, {
      content: streamedContent,
      mode: insertionMode,
    });

    setAiPanelOpen(false);
    resetStreaming();
  }, [editor, streamedContent, insertionMode, setAiPanelOpen, resetStreaming]);

  const handleCancel = useCallback(() => {
    abort();
    setAiPanelOpen(false);
    resetStreaming();
  }, [abort, setAiPanelOpen, resetStreaming]);

  const handleRetry = useCallback(() => {
    if (lastInstruction) {
      void streamResponse(selectedText, lastInstruction);
    }
  }, [lastInstruction, selectedText, streamResponse]);

  // SSR safety check
  if (typeof window === "undefined") {
    return null;
  }

  if (!isAiPanelOpen) {
    return null;
  }

  const portalTarget = anchorElem ?? document.body;

  const panelContent = (
    <div
      className={cn(
        "absolute z-[100] max-w-md rounded-xl border p-4 shadow-xl",
        "bg-white dark:bg-zinc-900",
        "text-gray-900 dark:text-gray-100",
        "animate-in fade-in-0 zoom-in-95"
      )}
      style={{
        top: position.top,
        left: position.left,
      }}
    >
      {/* State: idle - Show command menu */}
      {operationState === "idle" && <AiCommandMenu onSelect={handlePromptSelect} />}

      {/* State: streaming - Show preview with stop button */}
      {operationState === "streaming" && (
        <div className="flex flex-col gap-4">
          <StreamingPreview content={streamedContent} isStreaming={true} />
          <InsertionModeSelector mode={insertionMode} onModeChange={setInsertionMode} />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleCancel}
              className={cn(
                "flex-1 rounded-md px-4 py-2 text-sm font-medium",
                "bg-secondary text-secondary-foreground",
                "hover:bg-secondary/80 transition-colors"
              )}
            >
              Stop
            </button>
          </div>
        </div>
      )}

      {/* State: complete - Show preview with insert/cancel buttons */}
      {operationState === "complete" && (
        <div className="flex flex-col gap-4">
          <StreamingPreview content={streamedContent} isStreaming={false} />
          <InsertionModeSelector mode={insertionMode} onModeChange={setInsertionMode} />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleCancel}
              className={cn(
                "flex-1 rounded-md px-4 py-2 text-sm font-medium",
                "bg-secondary text-secondary-foreground",
                "hover:bg-secondary/80 transition-colors"
              )}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleInsert}
              className={cn(
                "flex-1 rounded-md px-4 py-2 text-sm font-medium",
                "bg-primary text-primary-foreground",
                "hover:bg-primary/90 transition-colors"
              )}
            >
              Insert
            </button>
          </div>
        </div>
      )}

      {/* State: error - Show error message with retry button */}
      {operationState === "error" && (
        <div className="flex flex-col gap-4">
          <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3">
            <p className="text-sm font-medium text-destructive">Error generating content</p>
            {error && <p className="mt-1 text-xs text-destructive/80">{error}</p>}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleCancel}
              className={cn(
                "flex-1 rounded-md px-4 py-2 text-sm font-medium",
                "bg-secondary text-secondary-foreground",
                "hover:bg-secondary/80 transition-colors"
              )}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleRetry}
              className={cn(
                "flex-1 rounded-md px-4 py-2 text-sm font-medium",
                "bg-primary text-primary-foreground",
                "hover:bg-primary/90 transition-colors"
              )}
            >
              Retry
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return createPortal(panelContent, portalTarget);
}
