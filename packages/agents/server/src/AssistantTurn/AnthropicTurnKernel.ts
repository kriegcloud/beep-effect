/**
 * Anthropic streaming implementation of the {@link AgentTurnKernel} port.
 *
 * v1 md-aligned block scope only (paragraph/heading/quote/list/code) — no
 * mermaid/table/youtube, hence no semantic validators and no batched repair.
 * The model is driven through the idiomatic forced-tool surface: a Toolkit with
 * a single non-strict `respond` tool whose parameters schema is the assistant
 * envelope, forced via `toolChoice`. The Anthropic provider maps
 * `input_json_delta` SSE events to `tool-params-delta` stream parts carrying the
 * raw partial JSON; {@link scanChunk} incrementally extracts each completed
 * element of the top-level `"blocks"` array, which is decoded through the
 * provider-adapted per-block codec and emitted as an {@link IndexedBlock}.
 *
 * Invalid slices are dropped-and-logged (no repair tail in v1).
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { Turn } from "@beep/agents-domain";
import { AgentTurnKernel, TurnGenerationError } from "@beep/agents-use-cases/public";
import { AnthropicTurnPlan } from "@beep/anthropic";
import { Effect, Filter, Layer, Metric, Result, Stream } from "effect";
import * as S from "effect/Schema";
import { LanguageModel, Tool, Toolkit } from "effect/unstable/ai";
import { assistantBlockOutput } from "./AnthropicTurnCodec.ts";
import { initialScanState, scanChunk } from "./ScanState.ts";
import type { IndexedBlock, TurnHistoryItem } from "@beep/agents-use-cases/public";
import type { Config } from "effect";
import type { AiError, Response } from "effect/unstable/ai";

const SYSTEM_PROMPT = [
  "You are a helpful assistant in a rich-text chat application.",
  "Respond with well-structured content: use headings for sections,",
  "lists for enumerations, code blocks for code, and quotes when citing.",
  "Keep responses focused and conversational.",
].join(" ");

const blocksValidated = Metric.counter("agents_assistant_turn_blocks_total", {
  description: "Streamed assistant-turn blocks by validation result",
  incremental: true,
});

// The forced-tool pattern: claude is structured-output-capable, so the provider
// would default to `strict: true` (grammar compilation, which our block union
// exceeds). `Tool.Strict` false keeps the schema as plain validation guidance;
// every emitted block is still schema-validated on the way through the scanner.
const RespondTool = Tool.make("respond", {
  description: "Deliver the assistant response as rich-text blocks. You MUST respond with a JSON object.",
  parameters: Turn.AssistantContent,
}).annotate(Tool.Strict, false);

const RespondToolkit = Toolkit.make(RespondTool);

const decodeSlice = S.decodeUnknownEffect(S.fromJsonString(assistantBlockOutput.codec));

const markValid = Metric.update(Metric.withAttributes(blocksValidated, { result: "valid" }), 1);
const markInvalid = Metric.update(Metric.withAttributes(blocksValidated, { result: "invalid" }), 1);

// Validate-and-route: a valid slice emits as IndexedBlock; an invalid slice is
// dropped after a log + metric (Result.fail is skipped by filterMapEffect).
// matchEffect keeps the filter effect total (error channel `never`).
const routeBlock = Filter.makeEffect(([slice, index]: [string, number]) =>
  Effect.matchEffect(decodeSlice(slice), {
    onSuccess: (block): Effect.Effect<Result.Result<IndexedBlock, void>> =>
      Effect.as(markValid, Result.succeed<IndexedBlock>({ index, block })),
    onFailure: (error): Effect.Effect<Result.Result<IndexedBlock, void>> =>
      Effect.as(
        Effect.andThen(markInvalid, () =>
          Effect.logInfo("assistant-turn block failed validation, dropped", { index, issue: error.message })
        ),
        Result.fail<void>(undefined)
      ),
  })
);

type RespondStreamPart = Response.StreamPart<Toolkit.Tools<typeof RespondToolkit>>;

const streamTurn = (history: ReadonlyArray<TurnHistoryItem>): Stream.Stream<IndexedBlock, TurnGenerationError> => {
  // `AnthropicTurnPlan` is self-contained — it `provide`s the language model and
  // resolves the redacted API key from config — so the only failures crossing
  // the boundary are AiError (provider) and ConfigError (missing key), and the
  // requirement channel is `never`. The driver's plan type erases its `provides`
  // generic to `any`, so we pin the post-plan stream type explicitly here.
  const parts = LanguageModel.streamText({
    prompt: [
      { role: "system", content: SYSTEM_PROMPT },
      ...history.map((item) => ({ role: item.role, content: item.text })),
    ],
    toolkit: RespondToolkit,
    toolChoice: { tool: "respond" },
    disableToolCallResolution: true,
  }).pipe(Stream.withExecutionPlan(AnthropicTurnPlan, { preventFallbackOnPartialStream: true })) as Stream.Stream<
    RespondStreamPart,
    AiError.AiError | Config.ConfigError
  >;

  return parts.pipe(
    Stream.takeUntil((part) => part.type === "tool-params-end"),
    Stream.flatMap((part) => (part.type === "tool-params-delta" ? Stream.succeed(part.delta) : Stream.empty)),
    // mapAccum flattens the returned slices array into stream elements
    Stream.mapAccum(() => initialScanState, scanChunk),
    Stream.zipWithIndex,
    Stream.filterMapEffect(routeBlock),
    Stream.mapError((error) =>
      TurnGenerationError.make({ message: `Anthropic assistant turn failed: ${error.message}` })
    ),
    Stream.withSpan("agents.assistant_turn.stream")
  );
};

/**
 * Live Anthropic-backed {@link AgentTurnKernel} Layer. Self-contained: the
 * {@link AnthropicTurnPlan} provides the language model, so the only run-time
 * requirement is the redacted `AI_ANTHROPIC_API_KEY` config resolved by the
 * plan's provided client layer.
 *
 * @example
 * ```ts
 * import { AnthropicTurnKernel } from "@beep/agents-server/AnthropicTurnKernel"
 *
 * console.log(AnthropicTurnKernel)
 * ```
 *
 * @category layers
 * @since 0.0.0
 */
export const AnthropicTurnKernel: Layer.Layer<AgentTurnKernel> = Layer.succeed(AgentTurnKernel)({ streamTurn });
