/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Channel
 * Export: pipeToOrFail
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Channel.ts
 * Generated: 2026-02-19T04:14:10.640Z
 *
 * Overview:
 * Returns a new channel that pipes the output of this channel into the specified channel and preserves this channel's failures without providing them to the other channel for observation.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Channel, Data } from "effect"
 *
 * class SourceError extends Data.TaggedError("SourceError")<{
 *   readonly code: number
 * }> {}
 *
 * // Create a failing source channel
 * const failingSource = Channel.fail(new SourceError({ code: 404 }))
 * const safeTransform = Channel.succeed("transformed")
 *
 * // Pipe while preserving source failures
 * const safePipedChannel = Channel.pipeToOrFail(failingSource, safeTransform)
 *
 * // Source errors are preserved and not sent to transform channel
 * ```
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */

import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction,
} from "@beep/groking-effect-v4/runtime/Playground";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as ChannelModule from "effect/Channel";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "pipeToOrFail";
const exportKind = "const";
const moduleImportPath = "effect/Channel";
const sourceSummary =
  "Returns a new channel that pipes the output of this channel into the specified channel and preserves this channel's failures without providing them to the other channel for obse...";
const sourceExample =
  'import { Channel, Data } from "effect"\n\nclass SourceError extends Data.TaggedError("SourceError")<{\n  readonly code: number\n}> {}\n\n// Create a failing source channel\nconst failingSource = Channel.fail(new SourceError({ code: 404 }))\nconst safeTransform = Channel.succeed("transformed")\n\n// Pipe while preserving source failures\nconst safePipedChannel = Channel.pipeToOrFail(failingSource, safeTransform)\n\n// Source errors are preserved and not sent to transform channel';
const moduleRecord = ChannelModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect the export as a runtime value and capture shape/preview.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleCallableProbe = Effect.gen(function* () {
  yield* Console.log("If the value is callable, run a zero-arg probe to observe behavior.");
  yield* probeNamedExportFunction({ moduleRecord, exportName });
});

/* ========================================================================== *
 * Program
 * ========================================================================== */
const program = createPlaygroundProgram({
  icon: "🔎",
  moduleImportPath,
  exportName,
  exportKind,
  summary: sourceSummary,
  sourceExample,
  bunContext: BunContext,
  examples: [
    {
      title: "Runtime Shape Inspection",
      description: "Inspect module export count, runtime type, and formatted preview.",
      run: exampleRuntimeInspection,
    },
    {
      title: "Callable Value Probe",
      description: "Attempt a zero-arg invocation when the value is function-like.",
      run: exampleCallableProbe,
    },
  ],
});

BunRuntime.runMain(program);
