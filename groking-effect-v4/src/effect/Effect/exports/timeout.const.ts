/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Effect
 * Export: timeout
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Effect.ts
 * Generated: 2026-02-19T04:14:12.395Z
 *
 * Overview:
 * Adds a time limit to an effect, triggering a timeout if the effect exceeds the duration.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect } from "effect"
 *
 * const task = Effect.gen(function*() {
 *   console.log("Start processing...")
 *   yield* Effect.sleep("2 seconds") // Simulates a delay in processing
 *   console.log("Processing complete.")
 *   return "Result"
 * })
 *
 * // Output will show a TimeoutException as the task takes longer
 * // than the specified timeout duration
 * const timedEffect = task.pipe(Effect.timeout("1 second"))
 *
 * Effect.runPromiseExit(timedEffect).then(console.log)
 * // Output:
 * // Start processing...
 * // {
 * //   _id: 'Exit',
 * //   _tag: 'Failure',
 * //   cause: {
 * //     _id: 'Cause',
 * //     _tag: 'Fail',
 * //     failure: { _tag: 'TimeoutException' }
 * //   }
 * // }
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
const exportName = "timeout";
const exportKind = "const";
const moduleImportPath = "effect/Effect";
const sourceSummary = "Adds a time limit to an effect, triggering a timeout if the effect exceeds the duration.";
const sourceExample =
  'import { Effect } from "effect"\n\nconst task = Effect.gen(function*() {\n  console.log("Start processing...")\n  yield* Effect.sleep("2 seconds") // Simulates a delay in processing\n  console.log("Processing complete.")\n  return "Result"\n})\n\n// Output will show a TimeoutException as the task takes longer\n// than the specified timeout duration\nconst timedEffect = task.pipe(Effect.timeout("1 second"))\n\nEffect.runPromiseExit(timedEffect).then(console.log)\n// Output:\n// Start processing...\n// {\n//   _id: \'Exit\',\n//   _tag: \'Failure\',\n//   cause: {\n//     _id: \'Cause\',\n//     _tag: \'Fail\',\n//     failure: { _tag: \'TimeoutException\' }\n//   }\n// }';
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
