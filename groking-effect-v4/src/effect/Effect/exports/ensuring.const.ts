/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Effect
 * Export: ensuring
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Effect.ts
 * Generated: 2026-02-19T04:14:12.387Z
 *
 * Overview:
 * Returns an effect that, if this effect _starts_ execution, then the specified `finalizer` is guaranteed to be executed, whether this effect succeeds, fails, or is interrupted.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect } from "effect"
 *
 * const task = Effect.gen(function*() {
 *   yield* Console.log("Task started")
 *   yield* Effect.sleep("1 second")
 *   yield* Console.log("Task completed")
 *   return 42
 * })
 *
 * // Ensure cleanup always runs, regardless of success or failure
 * const program = Effect.ensuring(
 *   task,
 *   Console.log("Cleanup: This always runs!")
 * )
 *
 * Effect.runPromise(program).then(console.log)
 * // Output:
 * // Task started
 * // Task completed
 * // Cleanup: This always runs!
 * // 42
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
const exportName = "ensuring";
const exportKind = "const";
const moduleImportPath = "effect/Effect";
const sourceSummary =
  "Returns an effect that, if this effect _starts_ execution, then the specified `finalizer` is guaranteed to be executed, whether this effect succeeds, fails, or is interrupted.";
const sourceExample =
  'import { Console, Effect } from "effect"\n\nconst task = Effect.gen(function*() {\n  yield* Console.log("Task started")\n  yield* Effect.sleep("1 second")\n  yield* Console.log("Task completed")\n  return 42\n})\n\n// Ensure cleanup always runs, regardless of success or failure\nconst program = Effect.ensuring(\n  task,\n  Console.log("Cleanup: This always runs!")\n)\n\nEffect.runPromise(program).then(console.log)\n// Output:\n// Task started\n// Task completed\n// Cleanup: This always runs!\n// 42';
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
