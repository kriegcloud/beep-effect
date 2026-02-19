/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/TxSemaphore
 * Export: release
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/TxSemaphore.ts
 * Generated: 2026-02-19T04:14:23.495Z
 *
 * Overview:
 * Releases a single permit back to the semaphore, making it available for acquisition.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect, TxSemaphore } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const semaphore = yield* TxSemaphore.make(2)
 *
 *   // Acquire a permit
 *   yield* TxSemaphore.acquire(semaphore)
 *   let available = yield* TxSemaphore.available(semaphore)
 *   yield* Console.log(`After acquire: ${available}`) // 1
 *
 *   // Release the permit
 *   yield* TxSemaphore.release(semaphore)
 *   available = yield* TxSemaphore.available(semaphore)
 *   yield* Console.log(`After release: ${available}`) // 2
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
const exportName = "release";
const exportKind = "const";
const moduleImportPath = "effect/TxSemaphore";
const sourceSummary = "Releases a single permit back to the semaphore, making it available for acquisition.";
const sourceExample =
  'import { Console, Effect, TxSemaphore } from "effect"\n\nconst program = Effect.gen(function*() {\n  const semaphore = yield* TxSemaphore.make(2)\n\n  // Acquire a permit\n  yield* TxSemaphore.acquire(semaphore)\n  let available = yield* TxSemaphore.available(semaphore)\n  yield* Console.log(`After acquire: ${available}`) // 1\n\n  // Release the permit\n  yield* TxSemaphore.release(semaphore)\n  available = yield* TxSemaphore.available(semaphore)\n  yield* Console.log(`After release: ${available}`) // 2\n})';
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
