/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/TxSemaphore
 * Export: withPermits
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/TxSemaphore.ts
 * Generated: 2026-02-19T04:14:23.495Z
 *
 * Overview:
 * Executes an effect with the specified number of permits from the semaphore. The permits are automatically acquired before execution and released afterwards, even if the effect fails or is interrupted.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect, TxSemaphore } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const semaphore = yield* TxSemaphore.make(5)
 *
 *   // Execute batch operation with 3 permits
 *   const results = yield* TxSemaphore.withPermits(
 *     semaphore,
 *     3,
 *     Effect.gen(function*() {
 *       yield* Console.log("3 permits acquired, processing batch...")
 *       yield* Effect.sleep("200 millis") // Simulate batch processing
 *       return ["result1", "result2", "result3"]
 *     })
 *   )
 *
 *   yield* Console.log(`Batch results: ${results.join(", ")}`)
 *   // All 3 permits are automatically released here
 * })
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
import * as TxSemaphoreModule from "effect/TxSemaphore";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "withPermits";
const exportKind = "const";
const moduleImportPath = "effect/TxSemaphore";
const sourceSummary =
  "Executes an effect with the specified number of permits from the semaphore. The permits are automatically acquired before execution and released afterwards, even if the effect f...";
const sourceExample =
  'import { Console, Effect, TxSemaphore } from "effect"\n\nconst program = Effect.gen(function*() {\n  const semaphore = yield* TxSemaphore.make(5)\n\n  // Execute batch operation with 3 permits\n  const results = yield* TxSemaphore.withPermits(\n    semaphore,\n    3,\n    Effect.gen(function*() {\n      yield* Console.log("3 permits acquired, processing batch...")\n      yield* Effect.sleep("200 millis") // Simulate batch processing\n      return ["result1", "result2", "result3"]\n    })\n  )\n\n  yield* Console.log(`Batch results: ${results.join(", ")}`)\n  // All 3 permits are automatically released here\n})';
const moduleRecord = TxSemaphoreModule as Record<string, unknown>;

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
