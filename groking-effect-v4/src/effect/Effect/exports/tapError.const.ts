/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Effect
 * Export: tapError
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Effect.ts
 * Generated: 2026-02-19T04:50:35.916Z
 *
 * Overview:
 * The `tapError` function executes an effectful operation to inspect the failure of an effect without modifying it.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect } from "effect"
 *
 * // Simulate a task that fails with an error
 * const task: Effect.Effect<number, string> = Effect.fail("NetworkError")
 *
 * // Use tapError to log the error message when the task fails
 * const tapping = Effect.tapError(
 *   task,
 *   (error) => Console.log(`expected error: ${error}`)
 * )
 *
 * Effect.runFork(tapping)
 * // Output:
 * // expected error: NetworkError
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
const exportName = "tapError";
const exportKind = "const";
const moduleImportPath = "effect/Effect";
const sourceSummary =
  "The `tapError` function executes an effectful operation to inspect the failure of an effect without modifying it.";
const sourceExample =
  'import { Console, Effect } from "effect"\n\n// Simulate a task that fails with an error\nconst task: Effect.Effect<number, string> = Effect.fail("NetworkError")\n\n// Use tapError to log the error message when the task fails\nconst tapping = Effect.tapError(\n  task,\n  (error) => Console.log(`expected error: ${error}`)\n)\n\nEffect.runFork(tapping)\n// Output:\n// expected error: NetworkError';
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
