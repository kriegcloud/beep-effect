/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Effect
 * Export: tapCauseIf
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Effect.ts
 * Generated: 2026-02-19T04:14:12.395Z
 *
 * Overview:
 * Conditionally executes a side effect based on the cause of a failed effect.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Cause, Console, Effect } from "effect"
 *
 * const task = Effect.fail("Network timeout")
 *
 * // Only log causes that contain failures (not interrupts or defects)
 * const program = Effect.tapCauseIf(
 *   task,
 *   Cause.hasFails,
 *   (cause) => Console.log(`Logging failure cause: ${Cause.squash(cause)}`)
 * )
 *
 * Effect.runPromiseExit(program).then(console.log)
 * // Output: "Logging failure cause: Network timeout"
 * // Then: { _id: 'Exit', _tag: 'Failure', cause: ... }
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
const exportName = "tapCauseIf";
const exportKind = "const";
const moduleImportPath = "effect/Effect";
const sourceSummary = "Conditionally executes a side effect based on the cause of a failed effect.";
const sourceExample =
  'import { Cause, Console, Effect } from "effect"\n\nconst task = Effect.fail("Network timeout")\n\n// Only log causes that contain failures (not interrupts or defects)\nconst program = Effect.tapCauseIf(\n  task,\n  Cause.hasFails,\n  (cause) => Console.log(`Logging failure cause: ${Cause.squash(cause)}`)\n)\n\nEffect.runPromiseExit(program).then(console.log)\n// Output: "Logging failure cause: Network timeout"\n// Then: { _id: \'Exit\', _tag: \'Failure\', cause: ... }';
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
