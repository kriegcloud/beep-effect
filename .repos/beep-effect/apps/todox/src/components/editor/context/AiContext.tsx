"use client";

import { createContext, type ReactNode, useCallback, useContext, useMemo, useState } from "react";
import type { AiOperationState, InsertionMode } from "../plugins/AiAssistantPlugin/types";
import { MissingContextError } from "../schema/errors";

interface AiContextValue {
  // Panel state
  readonly isAiPanelOpen: boolean;
  readonly setAiPanelOpen: (open: boolean) => void;

  // Selection state
  readonly selectedText: string;
  readonly setSelectedText: (text: string) => void;

  // Streaming state
  readonly operationState: AiOperationState;
  readonly setOperationState: (state: AiOperationState) => void;
  readonly streamedContent: string;
  readonly setStreamedContent: (content: string) => void;

  // Insertion mode
  readonly insertionMode: InsertionMode;
  readonly setInsertionMode: (mode: InsertionMode) => void;

  // Error state
  readonly error: string | null;
  readonly setError: (error: string | null) => void;

  // Reset all state
  readonly reset: () => void;
}

const AiContext = createContext<AiContextValue | null>(null);

export function AiContextProvider({ children }: { readonly children: ReactNode }) {
  const [isAiPanelOpen, setAiPanelOpen] = useState(false);
  const [selectedText, setSelectedText] = useState("");
  const [operationState, setOperationState] = useState<AiOperationState>("idle");
  const [streamedContent, setStreamedContent] = useState("");
  const [insertionMode, setInsertionMode] = useState<InsertionMode>("replace");
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setAiPanelOpen(false);
    setSelectedText("");
    setOperationState("idle");
    setStreamedContent("");
    setInsertionMode("replace");
    setError(null);
  }, []);

  const value = useMemo<AiContextValue>(
    () => ({
      isAiPanelOpen,
      setAiPanelOpen,
      selectedText,
      setSelectedText,
      operationState,
      setOperationState,
      streamedContent,
      setStreamedContent,
      insertionMode,
      setInsertionMode,
      error,
      setError,
      reset,
    }),
    [isAiPanelOpen, selectedText, operationState, streamedContent, insertionMode, error, reset]
  );

  return <AiContext.Provider value={value}>{children}</AiContext.Provider>;
}

export function useAiContext(): AiContextValue {
  const context = useContext(AiContext);
  if (context === null) {
    throw new MissingContextError({
      message: "useAiContext must be used within AiContextProvider",
      contextName: "AiContext",
    });
  }
  return context;
}

/**
 * Safe version of useAiContext that returns null when no provider is present.
 * Use in components that may render outside AiContextProvider (e.g. mail compose toolbar).
 */
export function useAiContextSafe(): AiContextValue | null {
  return useContext(AiContext);
}
