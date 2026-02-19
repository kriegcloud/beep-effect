/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/TxSemaphore
 * Export: available
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/TxSemaphore.ts
 * Generated: 2026-02-19T04:50:44.490Z
 *
 * Overview:
 * Gets the current number of available permits in the semaphore.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect, TxSemaphore } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const semaphore = yield* TxSemaphore.make(5)
 *
 *   // Check available permits before acquiring
 *   const before = yield* TxSemaphore.available(semaphore)
 *   yield* Console.log(`Available permits: ${before}`) // 5
 *
 *   // Acquire some permits
 *   yield* TxSemaphore.acquire(semaphore)
 *   yield* TxSemaphore.acquire(semaphore)
 *
 *   // Check available permits after acquiring
 *   const after = yield* TxSemaphore.available(semaphore)
 *   yield* Console.log(`Available permits: ${after}`) // 3
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
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as TxSemaphoreModule from "effect/TxSemaphore";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "available";
const exportKind = "const";
const moduleImportPath = "effect/TxSemaphore";
const sourceSummary = "Gets the current number of available permits in the semaphore.";
const sourceExample =
  'import { Console, Effect, TxSemaphore } from "effect"\n\nconst program = Effect.gen(function*() {\n  const semaphore = yield* TxSemaphore.make(5)\n\n  // Check available permits before acquiring\n  const before = yield* TxSemaphore.available(semaphore)\n  yield* Console.log(`Available permits: ${before}`) // 5\n\n  // Acquire some permits\n  yield* TxSemaphore.acquire(semaphore)\n  yield* TxSemaphore.acquire(semaphore)\n\n  // Check available permits after acquiring\n  const after = yield* TxSemaphore.available(semaphore)\n  yield* Console.log(`Available permits: ${after}`) // 3\n})';
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
