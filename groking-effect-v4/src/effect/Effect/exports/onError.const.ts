/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Effect
 * Export: onError
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Effect.ts
 * Generated: 2026-02-19T04:50:35.912Z
 *
 * Overview:
 * Runs the specified effect if this effect fails, providing the error to the effect if it exists. The provided effect will not be interrupted.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Cause, Console, Effect } from "effect"
 *
 * const task = Effect.fail(new Error("Something went wrong"))
 *
 * const program = Effect.onError(
 *   task,
 *   (cause) => Console.log(`Cleanup on error: ${Cause.squash(cause)}`)
 * )
 *
 * Effect.runPromise(program).catch(console.error)
 * // Output:
 * // Cleanup on error: Error: Something went wrong
 * // Error: Something went wrong
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
const exportName = "onError";
const exportKind = "const";
const moduleImportPath = "effect/Effect";
const sourceSummary =
  "Runs the specified effect if this effect fails, providing the error to the effect if it exists. The provided effect will not be interrupted.";
const sourceExample =
  'import { Cause, Console, Effect } from "effect"\n\nconst task = Effect.fail(new Error("Something went wrong"))\n\nconst program = Effect.onError(\n  task,\n  (cause) => Console.log(`Cleanup on error: ${Cause.squash(cause)}`)\n)\n\nEffect.runPromise(program).catch(console.error)\n// Output:\n// Cleanup on error: Error: Something went wrong\n// Error: Something went wrong';
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
