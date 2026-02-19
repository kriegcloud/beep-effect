/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/TxSemaphore
 * Export: tryAcquireN
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/TxSemaphore.ts
 * Generated: 2026-02-19T04:14:23.495Z
 *
 * Overview:
 * Tries to acquire the specified number of permits from the semaphore without blocking. Returns true if successful, false if not enough permits are available.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect, TxSemaphore } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const semaphore = yield* TxSemaphore.make(3)
 *
 *   // Try to acquire 2 permits (should succeed)
 *   const first = yield* TxSemaphore.tryAcquireN(semaphore, 2)
 *   yield* Console.log(`First try (2 permits): ${first}`) // true
 *
 *   // Try to acquire 2 more permits (should fail, only 1 left)
 *   const second = yield* TxSemaphore.tryAcquireN(semaphore, 2)
 *   yield* Console.log(`Second try (2 permits): ${second}`) // false
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
const exportName = "tryAcquireN";
const exportKind = "const";
const moduleImportPath = "effect/TxSemaphore";
const sourceSummary =
  "Tries to acquire the specified number of permits from the semaphore without blocking. Returns true if successful, false if not enough permits are available.";
const sourceExample =
  'import { Console, Effect, TxSemaphore } from "effect"\n\nconst program = Effect.gen(function*() {\n  const semaphore = yield* TxSemaphore.make(3)\n\n  // Try to acquire 2 permits (should succeed)\n  const first = yield* TxSemaphore.tryAcquireN(semaphore, 2)\n  yield* Console.log(`First try (2 permits): ${first}`) // true\n\n  // Try to acquire 2 more permits (should fail, only 1 left)\n  const second = yield* TxSemaphore.tryAcquireN(semaphore, 2)\n  yield* Console.log(`Second try (2 permits): ${second}`) // false\n})';
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
