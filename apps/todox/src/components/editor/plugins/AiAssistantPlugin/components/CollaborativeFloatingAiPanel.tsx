"use client";

import { cn } from "@beep/todox/lib/utils";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import * as O from "effect/Option";
import { $getSelection, $isRangeSelection } from "lexical";
import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

import { useAiContext } from "../../../context/AiContext";
import { INSERT_AI_TEXT_COMMAND } from "../commands";
import { useAiStreaming } from "../hooks/useAiStreaming";
import { type SerializedRange, useCollaborativeAi } from "../hooks/useCollaborativeAi";
import { AiActivityOverlay } from "./AiActivityIndicator";
import { AiCommandMenu } from "./AiCommandMenu";
import { InsertionModeSelector } from "./InsertionModeSelector";
import { StreamingPreview } from "./StreamingPreview";

interface CollaborativeFloatingAiPanelProps {
  readonly anchorElem?: HTMLElement;
}

/**
 * Get serialized range from current Lexical selection.
 * Returns null if no valid range selection exists.
 */
function getSerializedRangeFromSelection(
  editor: ReturnType<typeof useLexicalComposerContext>[0]
): SerializedRange | null {
  let range: SerializedRange | null = null;

  editor.getEditorState().read(() => {
    const selection = $getSelection();
    if (!$isRangeSelection(selection)) return;

    const anchor = selection.anchor;
    const focus = selection.focus;

    // Normalize to ensure start <= end
    const isBackward = selection.isBackward();
    const startKey = isBackward ? focus.key : anchor.key;
    const startOffset = isBackward ? focus.offset : anchor.offset;
    const endKey = isBackward ? anchor.key : focus.key;
    const endOffset = isBackward ? anchor.offset : focus.offset;

    range = {
      start: startOffset,
      end: endOffset,
      startKey,
      endKey,
    };
  });

  return range;
}

/**
 * Collaborative-aware floating AI panel that integrates with Liveblocks presence.
 *
 * Features:
 * - Broadcasts AI activity to other collaborators
 * - Detects conflicts when multiple users use AI on overlapping selections
 * - Shows warning banner when conflicts exist
 *
 * This component MUST be rendered inside a Liveblocks RoomProvider.
 * For non-collaborative mode, use the base FloatingAiPanel instead.
 */
export function CollaborativeFloatingAiPanel({ anchorElem }: CollaborativeFloatingAiPanelProps) {
  const [editor] = useLexicalComposerContext();

  const { isAiPanelOpen, setAiPanelOpen, selectedText, insertionMode, setInsertionMode } = useAiContext();

  const { streamedContent, operationState, error, streamResponse, abort, reset: resetStreaming } = useAiStreaming();

  const [lastInstruction, setLastInstruction] = useState<string>("");
  const [lastPromptLabel, setLastPromptLabel] = useState<string>("");

  // Get current selection range for conflict detection
  const selectionRange = useMemo(() => {
    if (!isAiPanelOpen) return null;
    return getSerializedRangeFromSelection(editor);
  }, [editor, isAiPanelOpen, selectedText]);

  // Collaborative AI hook for conflict detection and presence
  const { hasConflict, canProceed, conflictingUsers, broadcastAiActivity, clearAiActivity } =
    useCollaborativeAi(selectionRange);

  // Broadcast AI activity when operation state changes
  useEffect(() => {
    if (operationState === "streaming") {
      broadcastAiActivity(true, O.fromNullable(lastPromptLabel || null), O.fromNullable(selectionRange));
    } else {
      clearAiActivity();
    }
  }, [operationState, lastPromptLabel, selectionRange, broadcastAiActivity, clearAiActivity]);

  // Clear activity on unmount
  useEffect(() => {
    return () => {
      clearAiActivity();
    };
  }, [clearAiActivity]);

  const handlePromptSelect = useCallback(
    (promptId: string, instruction: string) => {
      if (!canProceed) {
        // Block operation when there's an active conflict
        return;
      }
      setLastInstruction(instruction);
      setLastPromptLabel(promptId);
      void streamResponse(selectedText, instruction);
    },
    [canProceed, selectedText, streamResponse]
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

  // Always render the activity overlay to show other collaborators' AI usage,
  // even when this user's panel is closed
  if (!isAiPanelOpen) {
    return createPortal(<AiActivityOverlay />, document.body);
  }

  const portalTarget = anchorElem ?? document.body;

  const panelContent = (
    <div
      className={cn(
        "fixed z-[100] max-w-md rounded-xl border p-4 shadow-xl",
        "bg-white dark:bg-zinc-900",
        "text-gray-900 dark:text-gray-100",
        "animate-in fade-in-0 zoom-in-95",
        "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      )}
    >
      {/* Conflict Warning Banner */}
      {hasConflict && (
        <div className="mb-4 rounded-md border border-amber-500/50 bg-amber-50 dark:bg-amber-950/30 p-3">
          <p className="text-sm font-medium text-amber-700 dark:text-amber-400">⚠️ Collaboration Warning</p>
          <p className="mt-1 text-xs text-amber-600 dark:text-amber-500">
            {conflictingUsers.map((u) => u.name).join(", ")} {conflictingUsers.length === 1 ? "is" : "are"} also using
            AI in this area. Proceeding may cause conflicts.
          </p>
        </div>
      )}

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
          {/* Show warning if conflict exists when trying to insert */}
          {hasConflict && (
            <p className="text-xs text-amber-600 dark:text-amber-500">
              Insert anyway? Changes may overlap with {conflictingUsers.map((u) => u.name).join(", ")}.
            </p>
          )}
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
                "hover:bg-primary/90 transition-colors",
                hasConflict && "ring-2 ring-amber-500 ring-offset-2"
              )}
            >
              {hasConflict ? "Insert Anyway" : "Insert"}
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

  return (
    <>
      {/* Overlay showing all collaborators using AI - always visible */}
      {createPortal(<AiActivityOverlay />, document.body)}
      {/* Main AI panel content */}
      {createPortal(panelContent, portalTarget)}
    </>
  );
}
