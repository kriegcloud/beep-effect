"use client";

import { useCallback, useRef, useState } from "react";

import type { AiOperationState } from "../types";

interface UseAiStreamingReturn {
  readonly streamedContent: string;
  readonly operationState: AiOperationState;
  readonly error: string | null;
  readonly streamResponse: (selectedText: string, instruction: string) => Promise<void>;
  readonly abort: () => void;
  readonly reset: () => void;
}

interface SSEDeltaPayload {
  readonly delta: string;
}

interface SSEDonePayload {
  readonly done: true;
}

interface SSEErrorPayload {
  readonly error: {
    readonly code: string;
    readonly message: string;
  };
}

type SSEPayload = SSEDeltaPayload | SSEDonePayload | SSEErrorPayload;

function isSSEDelta(payload: SSEPayload): payload is SSEDeltaPayload {
  return "delta" in payload;
}

function isSSEDone(payload: SSEPayload): payload is SSEDonePayload {
  return "done" in payload && payload.done === true;
}

function isSSEError(payload: SSEPayload): payload is SSEErrorPayload {
  return "error" in payload;
}

export function useAiStreaming(): UseAiStreamingReturn {
  const [streamedContent, setStreamedContent] = useState<string>("");
  const [operationState, setOperationState] = useState<AiOperationState>("idle");
  const [error, setError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  const streamResponse = useCallback(async (selectedText: string, instruction: string): Promise<void> => {
    // Cancel any in-flight request before starting a new one
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();

    setOperationState("streaming");
    setStreamedContent("");
    setError(null);

    try {
      const response = await fetch("/api/ai/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: selectedText, instruction }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No response body available");
      }

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // SSE messages are separated by double newlines
        const messages = buffer.split("\n\n");
        // Keep the last incomplete chunk in the buffer
        buffer = messages.pop() ?? "";

        for (const message of messages) {
          // Skip empty messages
          if (!message.trim()) continue;

          // SSE format: lines starting with "data: "
          if (!message.startsWith("data: ")) continue;

          const jsonStr = message.slice(6); // Remove "data: " prefix

          let payload: SSEPayload;
          try {
            payload = JSON.parse(jsonStr) as SSEPayload;
          } catch {
            // Skip malformed JSON payloads
            continue;
          }

          if (isSSEError(payload)) {
            setError(payload.error.message);
            setOperationState("error");
            return;
          }

          if (isSSEDone(payload)) {
            setOperationState("complete");
            return;
          }

          if (isSSEDelta(payload)) {
            setStreamedContent((prev) => prev + payload.delta);
          }
        }
      }

      // Stream ended without explicit done signal - treat as complete
      setOperationState("complete");
    } catch (err) {
      // AbortError is expected when user cancels - return to idle silently
      if (err instanceof Error && err.name === "AbortError") {
        setOperationState("idle");
        return;
      }

      setOperationState("error");
      const message = err instanceof Error ? err.message : "An unexpected error occurred";
      setError(message);
    }
  }, []);

  const abort = useCallback((): void => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setOperationState("idle");
  }, []);

  const reset = useCallback((): void => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
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
