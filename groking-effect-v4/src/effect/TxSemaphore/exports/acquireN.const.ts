/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/TxSemaphore
 * Export: acquireN
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/TxSemaphore.ts
 * Generated: 2026-02-19T04:14:23.495Z
 *
 * Overview:
 * Acquires the specified number of permits from the semaphore. If not enough permits are available, the effect will block until they become available.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect, TxSemaphore } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const semaphore = yield* TxSemaphore.make(5)
 *
 *   yield* Console.log("Acquiring 3 permits...")
 *   yield* TxSemaphore.acquireN(semaphore, 3)
 *   yield* Console.log("3 permits acquired")
 *
 *   const available = yield* TxSemaphore.available(semaphore)
 *   yield* Console.log(`Available permits: ${available}`) // 2
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
const exportName = "acquireN";
const exportKind = "const";
const moduleImportPath = "effect/TxSemaphore";
const sourceSummary =
  "Acquires the specified number of permits from the semaphore. If not enough permits are available, the effect will block until they become available.";
const sourceExample =
  'import { Console, Effect, TxSemaphore } from "effect"\n\nconst program = Effect.gen(function*() {\n  const semaphore = yield* TxSemaphore.make(5)\n\n  yield* Console.log("Acquiring 3 permits...")\n  yield* TxSemaphore.acquireN(semaphore, 3)\n  yield* Console.log("3 permits acquired")\n\n  const available = yield* TxSemaphore.available(semaphore)\n  yield* Console.log(`Available permits: ${available}`) // 2\n})';
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
