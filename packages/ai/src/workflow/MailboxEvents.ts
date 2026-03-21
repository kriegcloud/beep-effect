import type { ChatStreamPart } from "@repo/domain/Chat";
import { type Cause, Effect, Queue } from "effect";

/**
 * MailboxEvents - Typed event emitter for ChatStreamPart
 * Provides high-level methods for common event patterns to eliminate boilerplate
 */
export const createMailboxEvents = (
  queue: Queue.Queue<typeof ChatStreamPart.Type, Cause.Done>,
) =>
  ({
    thinking: (message: string) =>
      Queue.offer(queue, { _tag: "thinking", message }),
    iterationStart: (iteration: number) =>
      Queue.offer(queue, { _tag: "iteration-start", iteration }),
    iterationEnd: (iteration: number) =>
      Queue.offer(queue, { _tag: "iteration-end", iteration }),
    textDelta: (delta: string) =>
      Queue.offer(queue, { _tag: "text-delta", delta }),
    textComplete: () => Queue.offer(queue, { _tag: "text-complete" }),
    toolCallStart: (
      id: string,
      params: {
        name: string;
        description?: string;
      },
    ) =>
      Queue.offer(queue, {
        _tag: "tool-call-start",
        id,
        name: params.name,
        description: params.description,
      }),
    toolCallDelta: (id: string, params: { argumentsDelta: string }) =>
      Queue.offer(queue, {
        _tag: "tool-call-delta",
        id,
        argumentsDelta: params.argumentsDelta,
      }),
    toolCallComplete: (
      id: string,
      params: {
        name: string;
        arguments: unknown;
      },
    ) =>
      Queue.offer(queue, {
        _tag: "tool-call-complete",
        id,
        name: params.name,
        arguments: params.arguments,
      }),
    toolExecution: (
      id: string,
      params: {
        name: string;
        result: string;
        success: boolean;
      },
    ) =>
      Effect.gen(function* () {
        yield* Queue.offer(queue, {
          _tag: "tool-execution-start",
          id,
          name: params.name,
        });

        yield* Queue.offer(queue, {
          _tag: "tool-execution-complete",
          id,
          name: params.name,
          result: params.result,
          success: params.success,
        });
      }),
    toolExecutionStart: (id: string, params: { name: string }) =>
      Queue.offer(queue, {
        _tag: "tool-execution-start",
        id,
        name: params.name,
      }),
    toolExecutionComplete: (
      id: string,
      params: {
        name: string;
        result: string;
        success: boolean;
      },
    ) =>
      Queue.offer(queue, {
        _tag: "tool-execution-complete",
        id,
        name: params.name,
        result: params.result,
        success: params.success,
      }),
    finish: (
      finishReason: string,
      usage?: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
      },
    ) =>
      Queue.offer(queue, {
        _tag: "finish",
        finishReason,
        usage,
      }),
    error: (message: string, recoverable = false) =>
      Queue.offer(queue, { _tag: "error", message, recoverable }),
    end: Queue.end(queue),
  }) as const;
