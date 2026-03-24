import type { ChatStreamPart } from "@repo/domain/Chat";
import { type Cause, Effect, type Queue, Ref, Schema, Stream } from "effect";
import type {
  AiError,
  Chat,
  LanguageModel,
  Tool,
  Toolkit,
} from "effect/unstable/ai";
import { createMailboxEvents } from "./MailboxEvents";

export const AgenticLoopState = Schema.Struct({
  finishReason: Schema.String,
  iteration: Schema.Number,
});

export type AgenticLoopResult = Schema.Schema.Type<typeof AgenticLoopState>;

export type AgenticLoopRequirements =
  | LanguageModel.LanguageModel
  | Tool.HandlersFor<any>
  | Tool.HandlerServices<any>
  | Tool.ResultDecodingServices<any>;

// Schema for parsing tool parameters (JSON string -> object with unknown keys/values)
export const ToolParamsSchema = Schema.fromJsonString(
  Schema.Record(Schema.String, Schema.Unknown),
);

const loop = ({
  chat,
  queue,
  toolkit,
}: {
  chat: Chat.Service;
  queue: Queue.Queue<typeof ChatStreamPart.Type, Cause.Done>;
  toolkit: Toolkit.WithHandler<any>;
}) =>
  Effect.gen(function* () {
    const events = createMailboxEvents(queue);
    const finishReasonRef = yield* Ref.make("stop");
    const toolParamsRef = yield* Ref.make(
      new Map<
        string,
        {
          id: string;
          name: string;
          params: string;
        }
      >(),
    );

    yield* chat
      .streamText({
        prompt: [],
        toolkit,
      })
      .pipe(
        Stream.runForEach((part) =>
          Effect.gen(function* () {
            switch (part.type) {
              case "text-delta":
                yield* events.textDelta(part.delta);
                break;

              case "tool-params-start":
                yield* Effect.logInfo(`Selected tool: ${part.name}`);

                yield* Ref.update(toolParamsRef, (map) => {
                  const newMap = new Map(map);
                  newMap.set(part.id, {
                    id: part.id,
                    name: part.name,
                    params: "",
                  });
                  return newMap;
                });

                yield* events.toolCallStart(part.id, {
                  name: part.name,
                });
                break;

              case "tool-params-delta": {
                const toolParamsMap = yield* Ref.get(toolParamsRef);
                const existing = toolParamsMap.get(part.id);

                if (!existing) {
                  yield* Effect.logError(
                    `Received tool-params-delta for unknown tool: ${part.id}`,
                  );
                  break;
                }

                yield* Ref.update(toolParamsRef, (map) => {
                  const newMap = new Map(map);
                  newMap.set(part.id, {
                    ...existing,
                    params: existing.params + part.delta,
                  });
                  return newMap;
                });

                yield* events.toolCallDelta(part.id, {
                  argumentsDelta: part.delta,
                });
                break;
              }

              case "tool-params-end": {
                const toolParamsMap = yield* Ref.get(toolParamsRef);
                const toolCall = toolParamsMap.get(part.id);

                if (!toolCall) {
                  yield* Effect.logError(
                    `Received tool-params-end for unknown tool: ${part.id}`,
                  );
                  break;
                }

                const parsedParams = yield* Schema.decodeUnknownEffect(
                  ToolParamsSchema,
                )(toolCall.params?.trim() || "{}").pipe(
                  Effect.tapError((error) =>
                    Effect.logError(
                      `Failed to parse tool arguments for ${toolCall.name}: ${JSON.stringify(error)}`,
                    ),
                  ),
                  Effect.orElseSucceed(() => ({})),
                );

                yield* events.toolCallComplete(toolCall.id, {
                  name: toolCall.name,
                  arguments: parsedParams,
                });

                yield* events.toolExecutionStart(toolCall.id, {
                  name: toolCall.name,
                });
                break;
              }

              case "tool-result": {
                const resultText =
                  typeof part.result === "string"
                    ? part.result
                    : JSON.stringify(part.result);

                if (part.isFailure) {
                  yield* Effect.logError(
                    `Tool ${part.name}(${part.id}) failed: ${resultText}`,
                  );
                }

                yield* events.toolExecutionComplete(part.id, {
                  name: part.name,
                  result: resultText,
                  success: !part.isFailure,
                });
                break;
              }

              case "finish":
                yield* Ref.set(finishReasonRef, part.reason);
                if (part.reason !== "tool-calls") {
                  yield* events.finish(part.reason, {
                    promptTokens: part.usage.inputTokens.total ?? 0,
                    completionTokens: part.usage.outputTokens.total ?? 0,
                    totalTokens:
                      (part.usage.inputTokens.total ?? 0) +
                      (part.usage.outputTokens.total ?? 0),
                  });
                }
                break;

              case "error":
                yield* events.error(
                  typeof part.error === "string"
                    ? part.error
                    : JSON.stringify(part.error),
                  false,
                );
                break;

              default:
                // Ignore other part types (reasoning, files, etc.)
                break;
            }
          }),
        ),
      );

    return yield* Ref.get(finishReasonRef);
  });

export const runAgenticLoop = ({
  chat,
  queue,
  toolkit,
  maxIterations = 12,
}: {
  chat: Chat.Service;
  queue: Queue.Queue<typeof ChatStreamPart.Type, Cause.Done>;
  toolkit: Toolkit.WithHandler<any>;
  maxIterations?: number;
}): Effect.Effect<
  AgenticLoopResult,
  AiError.AiError,
  AgenticLoopRequirements
> =>
  Effect.gen(function* () {
    const events = createMailboxEvents(queue);

    let state = { finishReason: "tool-calls", iteration: 0 };

    while (
      state.finishReason === "tool-calls" &&
      state.iteration < maxIterations
    ) {
      const iteration = state.iteration + 1;

      yield* events.iterationStart(iteration);

      const finishReason = yield* loop({ chat, queue, toolkit });

      yield* Effect.log(
        `Iteration ${iteration} completed with finishReason: ${finishReason}`,
      );

      state = { finishReason, iteration };
    }

    const finalState = state;

    // Handle max iterations case
    if (
      finalState.finishReason === "tool-calls" &&
      finalState.iteration >= maxIterations
    ) {
      yield* events.thinking(
        `Reached maximum iterations (${maxIterations}). Stopping here.`,
      );
    }

    return finalState;
  });
