/**
 * Line-transform pipeline helper backing the streaming process tool.
 *
 * Applies an ordered list of pure line transforms over a file's lines, tracking
 * processed/failed/skipped counts, wall-clock duration (via {@link Clock}), and
 * per-item failures as `{ item, error, stage }`. The built-in transforms are
 * total functions, so the failure path exists for completeness and for
 * `stopOnError` semantics rather than because the stages throw.
 *
 * @since 0.0.0
 * @packageDocumentation
 */

import { $NlpMcpId } from "@beep/identity";
import { LiteralKit } from "@beep/schema";
import { Clock, Effect, flow, Match } from "effect";
import * as A from "effect/Array";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { readLines } from "./TextStream.ts";

const $I = $NlpMcpId.create("Streaming/Pipeline");

/**
 * Identifier of a supported, pure line transform stage.
 *
 * @example
 * ```ts
 * import type { PipelineStage } from "@beep/nlp-mcp/Streaming/Pipeline"
 *
 * const stage: PipelineStage = "normalizeWhitespace"
 * console.log(stage)
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export const PipelineStage = LiteralKit([
  "lowercase",
  "normalizeWhitespace",
  "removePunctuation",
  "trim",
  "uppercase",
]).annotate(
  $I.annote("PipelineStage", {
    description: "Identifier of a supported, pure line transform stage.",
  })
);

/**
 * Type for {@link PipelineStage}.
 *
 * @example
 * ```ts
 * import type { PipelineStage } from "@beep/nlp-mcp/Streaming/Pipeline"
 *
 * const stages: ReadonlyArray<PipelineStage> = ["trim", "lowercase"]
 * console.log(stages.length)
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export type PipelineStage = typeof PipelineStage.Type;

/**
 * A single pipeline failure entry describing the item, message, and stage.
 *
 * @example
 * ```ts
 * import { PipelineError } from "@beep/nlp-mcp/Streaming/Pipeline"
 *
 * const error = PipelineError.make({ error: "failed", item: "raw", stage: "trim" })
 * console.log(error.stage)
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export class PipelineError extends S.Class<PipelineError>($I`PipelineError`)(
  {
    error: S.String.annotateKey({
      description: "Message describing why the item failed.",
    }),
    item: S.Unknown.annotateKey({
      description: "The input item that failed (line text or upstream value).",
    }),
    stage: S.String.annotateKey({
      description: "Name of the stage that produced the failure.",
    }),
  },
  $I.annote("PipelineError", {
    description: "A single pipeline failure entry describing the item, message, and stage.",
  })
) {}

/**
 * Outcome of running a line-transform pipeline over a file.
 *
 * @example
 * ```ts
 * import { PipelineResult } from "@beep/nlp-mcp/Streaming/Pipeline"
 *
 * const result = PipelineResult.make({
 *   durationMs: 1,
 *   errors: [],
 *   failed: 0,
 *   processed: 1,
 *   results: ["hello"],
 *   skipped: 0
 * })
 * console.log(result.processed)
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export class PipelineResult extends S.Class<PipelineResult>($I`PipelineResult`)(
  {
    durationMs: S.Finite.annotateKey({
      description: "Wall-clock duration of the run in milliseconds.",
    }),
    errors: S.Array(PipelineError).annotateKey({
      description: "Collected per-item failures.",
    }),
    failed: S.Finite.annotateKey({
      description: "Number of items that failed a stage.",
    }),
    processed: S.Finite.annotateKey({
      description: "Number of items processed to completion.",
    }),
    results: S.Array(S.Unknown).annotateKey({
      description: "Transformed output values in input order.",
    }),
    skipped: S.Finite.annotateKey({
      description: "Number of items skipped before processing.",
    }),
  },
  $I.annote("PipelineResult", {
    description: "Outcome of running a line-transform pipeline over a file.",
  })
) {}

const stageTransform: (stage: PipelineStage) => (value: string) => string = Match.type<PipelineStage>().pipe(
  Match.when("lowercase", () => Str.toLowerCase),
  Match.when("uppercase", () => Str.toUpperCase),
  Match.when("trim", () => Str.trim),
  Match.when("normalizeWhitespace", () => flow(Str.replace(/\s+/g, " "), Str.trim)),
  Match.when("removePunctuation", () => Str.replace(/[^\w\s]/g, "")),
  Match.exhaustive
);

const applyStages = (stages: ReadonlyArray<PipelineStage>, value: string): string =>
  A.reduce(stages, value, (acc, stage) => stageTransform(stage)(acc));

/**
 * Run an ordered list of line transforms over the lines of a file.
 *
 * Lines are read via {@link readLines} (optionally skipping blanks), each
 * surviving line is folded through `stages`, and aggregate counts plus duration
 * are returned. `maxLines` caps how many lines are considered; `stopOnError`
 * stops processing after the first failure (the built-in stages never fail, so
 * this only affects future custom stages).
 *
 * @example
 * ```ts
 * import { processFile } from "@beep/nlp-mcp/Streaming/Pipeline"
 *
 * console.log(processFile("/tmp/data.txt", ["trim", "lowercase"], { skipEmpty: true }))
 * ```
 *
 * @effects Reads the Effect `Clock` before and after processing, and reads file
 * content through {@link readLines}, which requires `FileSystem` and `Path` and
 * can fail with `PlatformError`.
 *
 * @since 0.0.0
 * @category processes
 */
export const processFile = Effect.fn("Pipeline.processFile")(function* (
  filePath: string,
  stages: ReadonlyArray<PipelineStage>,
  options: {
    readonly maxLines?: number | undefined;
    readonly skipEmpty?: boolean | undefined;
    readonly stopOnError?: boolean | undefined;
  } = {}
) {
  const startedAt = yield* Clock.currentTimeMillis;

  // Read raw lines (blanks included) so we can report how many were skipped;
  // `maxLines` still caps how many raw lines are read.
  const allLines = yield* readLines(filePath, options.maxLines === undefined ? {} : { maxLines: options.maxLines });
  const lines = options.skipEmpty === true ? A.filter(allLines, (line) => Str.isNonEmpty(Str.trim(line))) : allLines;
  const skipped = A.length(allLines) - A.length(lines);

  const results = A.map(lines, (line) => applyStages(stages, line));
  const finishedAt = yield* Clock.currentTimeMillis;

  return PipelineResult.make({
    durationMs: finishedAt - startedAt,
    errors: A.empty<PipelineError>(),
    failed: 0,
    processed: A.length(results),
    results,
    skipped,
  });
});
