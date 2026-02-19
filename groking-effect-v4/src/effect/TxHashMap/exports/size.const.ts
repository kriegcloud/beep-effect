/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/TxHashMap
 * Export: size
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/TxHashMap.ts
 * Generated: 2026-02-19T04:14:22.962Z
 *
 * Overview:
 * Returns the number of entries in the TxHashMap.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, TxHashMap } from "effect"
 * 
 * const program = Effect.gen(function*() {
 *   const metrics = yield* TxHashMap.make(
 *     ["requests", 1000],
 *     ["errors", 5],
 *     ["users", 50]
 *   )
 * 
 *   const count = yield* TxHashMap.size(metrics)
 *   console.log(count) // 3
 * 
 *   // Add more metrics
 *   yield* TxHashMap.set(metrics, "response_time", 250)
 *   const newCount = yield* TxHashMap.size(metrics)
 *   console.log(newCount) // 4
 * 
 *   // Remove a metric
 *   yield* TxHashMap.remove(metrics, "errors")
 *   const finalCount = yield* TxHashMap.size(metrics)
 *   console.log(finalCount) // 3
 * })
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
import * as TxHashMapModule from "effect/TxHashMap";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "size";
const exportKind = "const";
const moduleImportPath = "effect/TxHashMap";
const sourceSummary = "Returns the number of entries in the TxHashMap.";
const sourceExample = "import { Effect, TxHashMap } from \"effect\"\n\nconst program = Effect.gen(function*() {\n  const metrics = yield* TxHashMap.make(\n    [\"requests\", 1000],\n    [\"errors\", 5],\n    [\"users\", 50]\n  )\n\n  const count = yield* TxHashMap.size(metrics)\n  console.log(count) // 3\n\n  // Add more metrics\n  yield* TxHashMap.set(metrics, \"response_time\", 250)\n  const newCount = yield* TxHashMap.size(metrics)\n  console.log(newCount) // 4\n\n  // Remove a metric\n  yield* TxHashMap.remove(metrics, \"errors\")\n  const finalCount = yield* TxHashMap.size(metrics)\n  console.log(finalCount) // 3\n})";
const moduleRecord = TxHashMapModule as Record<string, unknown>;

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
