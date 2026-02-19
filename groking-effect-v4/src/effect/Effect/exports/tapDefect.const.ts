/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Effect
 * Export: tapDefect
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Effect.ts
 * Generated: 2026-02-19T04:14:12.395Z
 *
 * Overview:
 * Inspect severe errors or defects (non-recoverable failures) in an effect.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect } from "effect"
 * 
 * // Simulate a task that fails with a recoverable error
 * const task1: Effect.Effect<number, string> = Effect.fail("NetworkError")
 * 
 * // tapDefect won't log anything because NetworkError is not a defect
 * const tapping1 = Effect.tapDefect(
 *   task1,
 *   (cause) => Console.log(`defect: ${cause}`)
 * )
 * 
 * Effect.runFork(tapping1)
 * // No Output
 * 
 * // Simulate a severe failure in the system
 * const task2: Effect.Effect<number> = Effect.die(
 *   "Something went wrong"
 * )
 * 
 * // Log the defect using tapDefect
 * const tapping2 = Effect.tapDefect(
 *   task2,
 *   (cause) => Console.log(`defect: ${cause}`)
 * )
 * 
 * Effect.runFork(tapping2)
 * // Output:
 * // defect: RuntimeException: Something went wrong
 * //   ... stack trace ...
 * ```
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */
import * as Effect from "effect/Effect";
import * as Console from "effect/Console";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as EffectModule from "effect/Effect";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "tapDefect";
const exportKind = "const";
const moduleImportPath = "effect/Effect";
const sourceSummary = "Inspect severe errors or defects (non-recoverable failures) in an effect.";
const sourceExample = "import { Console, Effect } from \"effect\"\n\n// Simulate a task that fails with a recoverable error\nconst task1: Effect.Effect<number, string> = Effect.fail(\"NetworkError\")\n\n// tapDefect won't log anything because NetworkError is not a defect\nconst tapping1 = Effect.tapDefect(\n  task1,\n  (cause) => Console.log(`defect: ${cause}`)\n)\n\nEffect.runFork(tapping1)\n// No Output\n\n// Simulate a severe failure in the system\nconst task2: Effect.Effect<number> = Effect.die(\n  \"Something went wrong\"\n)\n\n// Log the defect using tapDefect\nconst tapping2 = Effect.tapDefect(\n  task2,\n  (cause) => Console.log(`defect: ${cause}`)\n)\n\nEffect.runFork(tapping2)\n// Output:\n// defect: RuntimeException: Something went wrong\n//   ... stack trace ...";
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
      run: exampleRuntimeInspection
    },
    {
      title: "Callable Value Probe",
      description: "Attempt a zero-arg invocation when the value is function-like.",
      run: exampleCallableProbe
    }
  ]
});

BunRuntime.runMain(program);
