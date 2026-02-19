/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/TxSemaphore
 * Export: TxSemaphore
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/TxSemaphore.ts
 * Generated: 2026-02-19T04:50:44.490Z
 *
 * Overview:
 * A transactional semaphore that manages permits using Software Transactional Memory (STM) semantics.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, TxSemaphore } from "effect"
 *
 * // Create a semaphore with 3 permits for managing concurrent database connections
 * const program = Effect.gen(function*() {
 *   const dbSemaphore = yield* TxSemaphore.make(3)
 *
 *   // Acquire a permit before accessing the database
 *   yield* TxSemaphore.acquire(dbSemaphore)
 *   console.log("Database connection acquired")
 *
 *   // Perform database operations...
 *
 *   // Release the permit when done
 *   yield* TxSemaphore.release(dbSemaphore)
 *   console.log("Database connection released")
 * })
 * ```
 *
 * Focus:
 * - Type-only exports (`type`, `interface`) are erased at runtime.
 * - Runtime examples still provide module-level context for learning.
 */

import {
  createPlaygroundProgram,
  inspectNamedExport,
  inspectTypeLikeExport,
} from "@beep/groking-effect-v4/runtime/Playground";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as TxSemaphoreModule from "effect/TxSemaphore";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "TxSemaphore";
const exportKind = "interface";
const moduleImportPath = "effect/TxSemaphore";
const sourceSummary =
  "A transactional semaphore that manages permits using Software Transactional Memory (STM) semantics.";
const sourceExample =
  'import { Effect, TxSemaphore } from "effect"\n\n// Create a semaphore with 3 permits for managing concurrent database connections\nconst program = Effect.gen(function*() {\n  const dbSemaphore = yield* TxSemaphore.make(3)\n\n  // Acquire a permit before accessing the database\n  yield* TxSemaphore.acquire(dbSemaphore)\n  console.log("Database connection acquired")\n\n  // Perform database operations...\n\n  // Release the permit when done\n  yield* TxSemaphore.release(dbSemaphore)\n  console.log("Database connection released")\n})';
const moduleRecord = TxSemaphoreModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleTypeRuntimeCheck = Effect.gen(function* () {
  yield* Console.log("Check runtime visibility for this type/interface export.");
  yield* inspectTypeLikeExport({ moduleRecord, exportName });
});

const exampleModuleContextInspection = Effect.gen(function* () {
  yield* Console.log("Inspect runtime module context around this type-like export.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

/* ========================================================================== *
 * Program
 * ========================================================================== */
const program = createPlaygroundProgram({
  icon: "🧠",
  moduleImportPath,
  exportName,
  exportKind,
  summary: sourceSummary,
  sourceExample,
  examples: [
    {
      title: "Type Erasure Check",
      description: "Confirm whether this symbol appears at runtime.",
      run: exampleTypeRuntimeCheck,
    },
    {
      title: "Module Context Inspection",
      description: "Inspect the runtime module value for additional context.",
      run: exampleModuleContextInspection,
    },
  ],
});

BunRuntime.runMain(program);
