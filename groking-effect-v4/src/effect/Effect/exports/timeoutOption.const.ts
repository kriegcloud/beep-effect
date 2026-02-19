/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Effect
 * Export: timeoutOption
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Effect.ts
 * Generated: 2026-02-19T04:14:12.395Z
 *
 * Overview:
 * Handles timeouts by returning an `Option` that represents either the result or a timeout.
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
 * const timedOutEffect = Effect.all([
 *   task.pipe(Effect.timeoutOption("3 seconds")),
 *   task.pipe(Effect.timeoutOption("1 second"))
 * ])
 * 
 * Effect.runPromise(timedOutEffect).then(console.log)
 * // Output:
 * // Start processing...
 * // Processing complete.
 * // Start processing...
 * // [
 * //   { _id: 'Option', _tag: 'Some', value: 'Result' },
 * //   { _id: 'Option', _tag: 'None' }
 * // ]
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
const exportName = "timeoutOption";
const exportKind = "const";
const moduleImportPath = "effect/Effect";
const sourceSummary = "Handles timeouts by returning an `Option` that represents either the result or a timeout.";
const sourceExample = "import { Effect } from \"effect\"\n\nconst task = Effect.gen(function*() {\n  console.log(\"Start processing...\")\n  yield* Effect.sleep(\"2 seconds\") // Simulates a delay in processing\n  console.log(\"Processing complete.\")\n  return \"Result\"\n})\n\nconst timedOutEffect = Effect.all([\n  task.pipe(Effect.timeoutOption(\"3 seconds\")),\n  task.pipe(Effect.timeoutOption(\"1 second\"))\n])\n\nEffect.runPromise(timedOutEffect).then(console.log)\n// Output:\n// Start processing...\n// Processing complete.\n// Start processing...\n// [\n//   { _id: 'Option', _tag: 'Some', value: 'Result' },\n//   { _id: 'Option', _tag: 'None' }\n// ]";
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
