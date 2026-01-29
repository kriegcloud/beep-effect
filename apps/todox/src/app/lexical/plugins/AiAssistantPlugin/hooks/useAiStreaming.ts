"use client";

import { readStreamableValue } from "@ai-sdk/rsc";
import { useCallback, useRef, useState } from "react";

import { improveText } from "src/actions/ai";

import type { AiOperationState } from "../types";

interface UseAiStreamingReturn {
  readonly streamedContent: string;
  readonly operationState: AiOperationState;
  readonly error: string | null;
  readonly streamResponse: (selectedText: string, instruction: string) => Promise<void>;
  readonly abort: () => void;
  readonly reset: () => void;
}

export function useAiStreaming(): UseAiStreamingReturn {
  const [streamedContent, setStreamedContent] = useState<string>("");
  const [operationState, setOperationState] = useState<AiOperationState>("idle");
  const [error, setError] = useState<string | null>(null);

  const abortRef = useRef<boolean>(false);

  const streamResponse = useCallback(async (selectedText: string, instruction: string): Promise<void> => {
    abortRef.current = false;
    setOperationState("streaming");
    setStreamedContent("");
    setError(null);

    try {
      const stream = await improveText(selectedText, instruction);

      for await (const chunk of readStreamableValue(stream)) {
        if (abortRef.current) {
          setOperationState("idle");
          return;
        }

        if (chunk !== undefined) {
          setStreamedContent((prev) => prev + chunk);
        }
      }

      if (!abortRef.current) {
        setOperationState("complete");
      }
    } catch (err) {
      setOperationState("error");
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    }
  }, []);

  const abort = useCallback((): void => {
    abortRef.current = true;
    setOperationState("idle");
  }, []);

  const reset = useCallback((): void => {
    abortRef.current = false;
    setStreamedContent("");
    setOperationState("idle");
    setError(null);
  }, []);

  return {
    streamedContent,
    operationState,
    error,
    streamResponse,
    abort,
    reset,
  };
}
