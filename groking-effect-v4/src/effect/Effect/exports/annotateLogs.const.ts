/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Effect
 * Export: annotateLogs
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Effect.ts
 * Generated: 2026-02-19T04:50:35.906Z
 *
 * Overview:
 * Adds an annotation to each log line in this effect.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   yield* Effect.log("Starting operation")
 *   yield* Effect.log("Processing data")
 *   yield* Effect.log("Operation completed")
 * })
 *
 * // Add annotations to all log messages
 * const annotatedProgram = Effect.annotateLogs(program, {
 *   userId: "user123",
 *   operation: "data-processing"
 * })
 *
 * // Also supports single key-value annotations
 * const singleAnnotated = Effect.annotateLogs(program, "requestId", "req-456")
 *
 * Effect.runPromise(annotatedProgram)
 * // All log messages will include the userId and operation annotations
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
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as EffectModule from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "annotateLogs";
const exportKind = "const";
const moduleImportPath = "effect/Effect";
const sourceSummary = "Adds an annotation to each log line in this effect.";
const sourceExample =
  'import { Effect } from "effect"\n\nconst program = Effect.gen(function*() {\n  yield* Effect.log("Starting operation")\n  yield* Effect.log("Processing data")\n  yield* Effect.log("Operation completed")\n})\n\n// Add annotations to all log messages\nconst annotatedProgram = Effect.annotateLogs(program, {\n  userId: "user123",\n  operation: "data-processing"\n})\n\n// Also supports single key-value annotations\nconst singleAnnotated = Effect.annotateLogs(program, "requestId", "req-456")\n\nEffect.runPromise(annotatedProgram)\n// All log messages will include the userId and operation annotations';
const moduleRecord = EffectModule as Record<string, unknown>;

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
