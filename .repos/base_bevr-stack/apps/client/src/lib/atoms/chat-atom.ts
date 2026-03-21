import type { ChatMessage, ChatResponse, ToolCall } from "@repo/domain/Chat";
import { Effect, Stream } from "effect";
import type { Atom } from "effect/unstable/reactivity";
import { runtime } from "../atom";
import { RpcClient } from "../rpc-client";

export const chatAtom: Atom.AtomResultFn<
  readonly ChatMessage[],
  ChatResponse,
  unknown
> = runtime.fn((messages: readonly ChatMessage[]) => {
  return Stream.unwrap(
    Effect.gen(function* () {
      const rpc = yield* RpcClient;
      return rpc.client.chat({ messages });
    }),
  ).pipe(
    Stream.tapError((error: unknown) =>
      Effect.logError("[chatAtom] Stream error occurred:", error),
    ),
    Stream.scan(
      {
        _tag: "initial",
      },
      (state, part): ChatResponse => {
        switch (part._tag) {
          case "text-delta": {
            const currentSegments =
              state._tag === "initial" ? [] : state.segments;
            const lastSegment = currentSegments[currentSegments.length - 1];

            if (lastSegment?._tag === "text" && !lastSegment.isComplete) {
              return {
                _tag: "streaming",
                segments: [
                  ...currentSegments.slice(0, -1),
                  {
                    _tag: "text",
                    content: lastSegment.content + part.delta,
                    isComplete: false,
                  },
                ],
                thinking:
                  state._tag === "streaming" ? state.thinking : undefined,
                currentIteration:
                  state._tag === "streaming" ? state.currentIteration : null,
              };
            }

            return {
              _tag: "streaming",
              segments: [
                ...currentSegments,
                {
                  _tag: "text",
                  content: part.delta,
                  isComplete: false,
                },
              ],
              thinking: state._tag === "streaming" ? state.thinking : undefined,
              currentIteration:
                state._tag === "streaming" ? state.currentIteration : null,
            };
          }

          case "text-complete": {
            if (state._tag !== "streaming") return state;
            const currentSegments = state.segments;
            const lastSegment = currentSegments[currentSegments.length - 1];

            if (lastSegment?._tag === "text" && !lastSegment.isComplete) {
              return {
                ...state,
                segments: [
                  ...currentSegments.slice(0, -1),
                  {
                    ...lastSegment,
                    isComplete: true,
                  },
                ],
              };
            }
            return state;
          }

          case "iteration-start": {
            const currentSegments =
              state._tag === "initial" ? [] : state.segments;
            return {
              _tag: "streaming",
              segments: currentSegments,
              currentIteration: part.iteration,
              thinking: state._tag === "streaming" ? state.thinking : undefined,
            };
          }

          case "iteration-end": {
            if (state._tag !== "streaming") return state;
            return {
              ...state,
              currentIteration: null,
            };
          }

          case "tool-call-start": {
            const currentSegments =
              state._tag === "initial" ? [] : state.segments;
            return {
              _tag: "streaming",
              segments: [
                ...currentSegments,
                {
                  _tag: "tool-call",
                  tool: {
                    id: part.id,
                    name: part.name,
                    arguments: null,
                    argumentsText: "",
                    status: "proposed",
                  },
                },
              ],
              thinking: state._tag === "streaming" ? state.thinking : undefined,
              currentIteration:
                state._tag === "streaming" ? state.currentIteration : null,
            };
          }

          case "tool-call-delta": {
            if (state._tag !== "streaming") return state;
            return {
              ...state,
              segments: state.segments.map((seg) =>
                seg._tag === "tool-call" && seg.tool.id === part.id
                  ? {
                      ...seg,
                      tool: {
                        ...seg.tool,
                        argumentsText:
                          seg.tool.argumentsText + part.argumentsDelta,
                      },
                    }
                  : seg,
              ),
            };
          }

          case "tool-call-complete": {
            if (state._tag !== "streaming") return state;
            return {
              ...state,
              segments: state.segments.map((seg) =>
                seg._tag === "tool-call" && seg.tool.id === part.id
                  ? {
                      ...seg,
                      tool: { ...seg.tool, arguments: part.arguments },
                    }
                  : seg,
              ),
            };
          }

          case "tool-execution-start": {
            if (state._tag !== "streaming") return state;
            return {
              ...state,
              segments: state.segments.map((seg) =>
                seg._tag === "tool-call" && seg.tool.id === part.id
                  ? {
                      ...seg,
                      tool: {
                        ...seg.tool,
                        status: "executing" as ToolCall["status"],
                      },
                    }
                  : seg,
              ),
            };
          }

          case "tool-execution-complete": {
            if (state._tag !== "streaming") return state;
            const newStatus: ToolCall["status"] = part.success
              ? "complete"
              : "failed";
            return {
              ...state,
              segments: state.segments.map((seg) =>
                seg._tag === "tool-call" && seg.tool.id === part.id
                  ? {
                      ...seg,
                      tool: {
                        ...seg.tool,
                        status: newStatus,
                        result: part.result,
                        success: part.success,
                      },
                    }
                  : seg,
              ),
            };
          }

          case "finish": {
            const segments = state._tag === "streaming" ? state.segments : [];
            return {
              _tag: "complete",
              segments,
              usage: part.usage,
              finishReason: part.finishReason,
            };
          }

          case "thinking": {
            const currentSegments =
              state._tag === "initial" ? [] : state.segments;
            return {
              _tag: "streaming",
              segments: currentSegments,
              thinking: part.message,
              currentIteration:
                state._tag === "streaming" ? state.currentIteration : null,
            };
          }

          case "error": {
            console.error("[chatAtom] Chat stream error received:", part);
            const segments = state._tag === "streaming" ? state.segments : [];
            return {
              _tag: "error",
              segments,
              error: {
                message: part.message,
                recoverable: part.recoverable,
              },
            };
          }

          default:
            return state;
        }
      },
    ),
    Stream.drop(1),
    Stream.catch((error: unknown) => {
      console.error("[chatAtom] Caught unhandled stream error:", error);
      const errorMessage =
        error instanceof Error
          ? `Stream failed: ${error.message}`
          : `Stream failed: ${String(error)}`;
      return Stream.make({
        _tag: "error" as const,
        segments: [],
        error: {
          message: errorMessage,
          recoverable: false,
        },
      } as ChatResponse);
    }),
  );
});
