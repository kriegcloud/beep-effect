/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/TxSemaphore
 * Export: isTxSemaphore
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/TxSemaphore.ts
 * Generated: 2026-02-19T04:50:44.490Z
 *
 * Overview:
 * Determines if the provided value is a TxSemaphore.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, TxSemaphore } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const semaphore = yield* TxSemaphore.make(5)
 *   const notSemaphore = { some: "object" }
 *
 *   console.log(TxSemaphore.isTxSemaphore(semaphore)) // true
 *   console.log(TxSemaphore.isTxSemaphore(notSemaphore)) // false
 *
 *   // Useful for runtime type checking in generic functions
 *   if (TxSemaphore.isTxSemaphore(semaphore)) {
 *     const available = yield* TxSemaphore.available(semaphore)
 *     console.log(`Available permits: ${available}`)
 *   }
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
const exportName = "isTxSemaphore";
const exportKind = "const";
const moduleImportPath = "effect/TxSemaphore";
const sourceSummary = "Determines if the provided value is a TxSemaphore.";
const sourceExample =
  'import { Effect, TxSemaphore } from "effect"\n\nconst program = Effect.gen(function*() {\n  const semaphore = yield* TxSemaphore.make(5)\n  const notSemaphore = { some: "object" }\n\n  console.log(TxSemaphore.isTxSemaphore(semaphore)) // true\n  console.log(TxSemaphore.isTxSemaphore(notSemaphore)) // false\n\n  // Useful for runtime type checking in generic functions\n  if (TxSemaphore.isTxSemaphore(semaphore)) {\n    const available = yield* TxSemaphore.available(semaphore)\n    console.log(`Available permits: ${available}`)\n  }\n})';
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
