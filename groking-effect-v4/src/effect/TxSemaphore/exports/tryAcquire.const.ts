/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/TxSemaphore
 * Export: tryAcquire
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/TxSemaphore.ts
 * Generated: 2026-02-19T04:50:44.490Z
 *
 * Overview:
 * Tries to acquire a single permit from the semaphore without blocking. Returns true if successful, false if no permits are available.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect, TxSemaphore } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const semaphore = yield* TxSemaphore.make(1)
 *
 *   // First try should succeed
 *   const first = yield* TxSemaphore.tryAcquire(semaphore)
 *   yield* Console.log(`First try: ${first}`) // true
 *
 *   // Second try should fail (no permits left)
 *   const second = yield* TxSemaphore.tryAcquire(semaphore)
 *   yield* Console.log(`Second try: ${second}`) // false
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
const exportName = "tryAcquire";
const exportKind = "const";
const moduleImportPath = "effect/TxSemaphore";
const sourceSummary =
  "Tries to acquire a single permit from the semaphore without blocking. Returns true if successful, false if no permits are available.";
const sourceExample =
  'import { Console, Effect, TxSemaphore } from "effect"\n\nconst program = Effect.gen(function*() {\n  const semaphore = yield* TxSemaphore.make(1)\n\n  // First try should succeed\n  const first = yield* TxSemaphore.tryAcquire(semaphore)\n  yield* Console.log(`First try: ${first}`) // true\n\n  // Second try should fail (no permits left)\n  const second = yield* TxSemaphore.tryAcquire(semaphore)\n  yield* Console.log(`Second try: ${second}`) // false\n})';
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
