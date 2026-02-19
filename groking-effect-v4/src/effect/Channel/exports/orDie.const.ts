/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Channel
 * Export: orDie
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Channel.ts
 * Generated: 2026-02-19T04:14:10.640Z
 *
 * Overview:
 * Converts all errors in the channel to defects (unrecoverable failures). This is useful when you want to treat errors as programming errors.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Channel, Data } from "effect"
 *
 * class ValidationError extends Data.TaggedError("ValidationError")<{
 *   readonly field: string
 * }> {}
 *
 * // Create a channel that might fail
 * const failingChannel = Channel.fail(new ValidationError({ field: "email" }))
 *
 * // Convert failures to defects
 * const fatalChannel = Channel.orDie(failingChannel)
 *
 * // Any failure will now become a defect (uncaught exception)
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
const exportName = "orDie";
const exportKind = "const";
const moduleImportPath = "effect/Channel";
const sourceSummary =
  "Converts all errors in the channel to defects (unrecoverable failures). This is useful when you want to treat errors as programming errors.";
const sourceExample =
  'import { Channel, Data } from "effect"\n\nclass ValidationError extends Data.TaggedError("ValidationError")<{\n  readonly field: string\n}> {}\n\n// Create a channel that might fail\nconst failingChannel = Channel.fail(new ValidationError({ field: "email" }))\n\n// Convert failures to defects\nconst fatalChannel = Channel.orDie(failingChannel)\n\n// Any failure will now become a defect (uncaught exception)';
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
