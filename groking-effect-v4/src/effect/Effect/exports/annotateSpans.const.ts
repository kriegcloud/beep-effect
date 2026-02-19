/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Effect
 * Export: annotateSpans
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Effect.ts
 * Generated: 2026-02-19T04:50:35.906Z
 *
 * Overview:
 * Adds an annotation to each span in this effect.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   yield* Effect.log("Doing some work...")
 *   return "result"
 * })
 *
 * // Add single annotation
 * const annotated1 = Effect.annotateSpans(program, "user", "john")
 *
 * // Add multiple annotations
 * const annotated2 = Effect.annotateSpans(program, {
 *   operation: "data-processing",
 *   version: "1.0.0",
 *   environment: "production"
 * })
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
const exportName = "annotateSpans";
const exportKind = "const";
const moduleImportPath = "effect/Effect";
const sourceSummary = "Adds an annotation to each span in this effect.";
const sourceExample =
  'import { Effect } from "effect"\n\nconst program = Effect.gen(function*() {\n  yield* Effect.log("Doing some work...")\n  return "result"\n})\n\n// Add single annotation\nconst annotated1 = Effect.annotateSpans(program, "user", "john")\n\n// Add multiple annotations\nconst annotated2 = Effect.annotateSpans(program, {\n  operation: "data-processing",\n  version: "1.0.0",\n  environment: "production"\n})';
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
