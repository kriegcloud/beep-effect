/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Effect
 * Export: match
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Effect.ts
 * Generated: 2026-02-19T04:14:12.390Z
 *
 * Overview:
 * Handles both success and failure cases of an effect without performing side effects.
 *
 * Source JSDoc Example:
 * ```ts
 * // Title: Handling Both Success and Failure Cases
 * import { Effect } from "effect"
 *
 * const success: Effect.Effect<number, Error> = Effect.succeed(42)
 *
 * const program1 = Effect.match(success, {
 *   onFailure: (error) => `failure: ${error.message}`,
 *   onSuccess: (value) => `success: ${value}`
 * })
 *
 * // Run and log the result of the successful effect
 * Effect.runPromise(program1).then(console.log)
 * // Output: "success: 42"
 *
 * const failure: Effect.Effect<number, Error> = Effect.fail(
 *   new Error("Uh oh!")
 * )
 *
 * const program2 = Effect.match(failure, {
 *   onFailure: (error) => `failure: ${error.message}`,
 *   onSuccess: (value) => `success: ${value}`
 * })
 *
 * // Run and log the result of the failed effect
 * Effect.runPromise(program2).then(console.log)
 * // Output: "failure: Uh oh!"
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
const exportName = "match";
const exportKind = "const";
const moduleImportPath = "effect/Effect";
const sourceSummary = "Handles both success and failure cases of an effect without performing side effects.";
const sourceExample =
  '// Title: Handling Both Success and Failure Cases\nimport { Effect } from "effect"\n\nconst success: Effect.Effect<number, Error> = Effect.succeed(42)\n\nconst program1 = Effect.match(success, {\n  onFailure: (error) => `failure: ${error.message}`,\n  onSuccess: (value) => `success: ${value}`\n})\n\n// Run and log the result of the successful effect\nEffect.runPromise(program1).then(console.log)\n// Output: "success: 42"\n\nconst failure: Effect.Effect<number, Error> = Effect.fail(\n  new Error("Uh oh!")\n)\n\nconst program2 = Effect.match(failure, {\n  onFailure: (error) => `failure: ${error.message}`,\n  onSuccess: (value) => `success: ${value}`\n})\n\n// Run and log the result of the failed effect\nEffect.runPromise(program2).then(console.log)\n// Output: "failure: Uh oh!"';
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
