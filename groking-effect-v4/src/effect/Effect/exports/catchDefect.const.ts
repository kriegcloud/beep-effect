/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Effect
 * Export: catchDefect
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Effect.ts
 * Generated: 2026-02-19T04:14:12.386Z
 *
 * Overview:
 * Recovers from all defects using a provided recovery function.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect } from "effect"
 *
 * // An effect that might throw an unexpected error (defect)
 * const program = Effect.sync(() => {
 *   throw new Error("Unexpected error")
 * })
 *
 * // Recover from defects only
 * const recovered = Effect.catchDefect(program, (defect) => {
 *   return Console.log(`Caught defect: ${defect}`).pipe(
 *     Effect.as("Recovered from defect")
 *   )
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
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as EffectModule from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "catchDefect";
const exportKind = "const";
const moduleImportPath = "effect/Effect";
const sourceSummary = "Recovers from all defects using a provided recovery function.";
const sourceExample =
  'import { Console, Effect } from "effect"\n\n// An effect that might throw an unexpected error (defect)\nconst program = Effect.sync(() => {\n  throw new Error("Unexpected error")\n})\n\n// Recover from defects only\nconst recovered = Effect.catchDefect(program, (defect) => {\n  return Console.log(`Caught defect: ${defect}`).pipe(\n    Effect.as("Recovered from defect")\n  )\n})';
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
