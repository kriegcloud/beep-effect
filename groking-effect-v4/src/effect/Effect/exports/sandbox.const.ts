/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Effect
 * Export: sandbox
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Effect.ts
 * Generated: 2026-02-19T04:50:35.914Z
 *
 * Overview:
 * The `sandbox` function transforms an effect by exposing the full cause of any error, defect, or fiber interruption that might occur during its execution. It changes the error channel of the effect to include detailed information about the cause, which is wrapped in a `Cause<E>` type.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Cause, Effect } from "effect"
 *
 * const task = Effect.fail("Something went wrong")
 *
 * // Sandbox exposes the full cause as the error type
 * const program = Effect.gen(function*() {
 *   const result = yield* Effect.flip(Effect.sandbox(task))
 *   return `Caught cause: ${Cause.squash(result)}`
 * })
 *
 * Effect.runPromise(program).then(console.log)
 * // Output: "Caught cause: Something went wrong"
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
const exportName = "sandbox";
const exportKind = "const";
const moduleImportPath = "effect/Effect";
const sourceSummary =
  "The `sandbox` function transforms an effect by exposing the full cause of any error, defect, or fiber interruption that might occur during its execution. It changes the error ch...";
const sourceExample =
  'import { Cause, Effect } from "effect"\n\nconst task = Effect.fail("Something went wrong")\n\n// Sandbox exposes the full cause as the error type\nconst program = Effect.gen(function*() {\n  const result = yield* Effect.flip(Effect.sandbox(task))\n  return `Caught cause: ${Cause.squash(result)}`\n})\n\nEffect.runPromise(program).then(console.log)\n// Output: "Caught cause: Something went wrong"';
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
