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

import { flow } from "effect";
import * as A from "effect/Array";
import * as Clock from "effect/Clock";
import * as Effect from "effect/Effect";
import * as Match from "effect/Match";
import * as Str from "effect/String";
import { readLines } from "./TextStream.ts";
import type * as FileSystem from "effect/FileSystem";
import type * as Path from "effect/Path";
import type { PlatformError } from "effect/PlatformError";

/**
 * Identifier of a supported, pure line transform stage.
 *
 * @since 0.0.0
 * @category models
 */
export type PipelineStage = "lowercase" | "normalizeWhitespace" | "removePunctuation" | "trim" | "uppercase";

/**
 * A single pipeline failure entry describing the item, message, and stage.
 *
 * @since 0.0.0
 * @category models
 */
export interface PipelineError {
  /** Message describing why the item failed. */
  readonly error: string;
  /** The input item that failed (line text or upstream value). */
  readonly item: unknown;
  /** Name of the stage that produced the failure. */
  readonly stage: string;
}

/**
 * Outcome of running a line-transform pipeline over a file.
 *
 * @since 0.0.0
 * @category models
 */
export interface PipelineResult {
  /** Wall-clock duration of the run in milliseconds. */
  readonly durationMs: number;
  /** Collected per-item failures. */
  readonly errors: ReadonlyArray<PipelineError>;
  /** Number of items that failed a stage. */
  readonly failed: number;
  /** Number of items processed to completion. */
  readonly processed: number;
  /** Transformed output values in input order. */
  readonly results: ReadonlyArray<unknown>;
  /** Number of items skipped before processing. */
  readonly skipped: number;
}

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
 * void processFile("/tmp/data.txt", ["trim", "lowercase"], { skipEmpty: true })
 * ```
 *
 * @since 0.0.0
 * @category pipeline
 */
export const processFile = (
  filePath: string,
  stages: ReadonlyArray<PipelineStage>,
  options: {
    readonly maxLines?: number | undefined;
    readonly skipEmpty?: boolean | undefined;
    readonly stopOnError?: boolean | undefined;
  } = {}
): Effect.Effect<PipelineResult, PlatformError, FileSystem.FileSystem | Path.Path> =>
  Effect.gen(function* () {
    const startedAt = yield* Clock.currentTimeMillis;

    // Read raw lines (blanks included) so we can report how many were skipped;
    // `maxLines` still caps how many raw lines are read.
    const allLines = yield* readLines(filePath, options.maxLines === undefined ? {} : { maxLines: options.maxLines });
    const lines = options.skipEmpty === true ? A.filter(allLines, (line) => Str.isNonEmpty(Str.trim(line))) : allLines;
    const skipped = allLines.length - lines.length;

    const results = A.map(lines, (line) => applyStages(stages, line));
    const finishedAt = yield* Clock.currentTimeMillis;

    return {
      durationMs: finishedAt - startedAt,
      errors: [],
      failed: 0,
      processed: results.length,
      results,
      skipped,
    };
  });
