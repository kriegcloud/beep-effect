/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/TxQueue
 * Export: failCause
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/TxQueue.ts
 * Generated: 2026-02-19T04:14:23.323Z
 *
 * Overview:
 * Completes the queue with the specified exit value.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Cause, Effect, TxQueue } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const queue = yield* TxQueue.bounded<number>(10)
 *
 *   // Complete with specific cause
 *   const cause = Cause.interrupt()
 *   const result = yield* TxQueue.failCause(queue, cause)
 *   console.log(result) // true
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
import * as TxQueueModule from "effect/TxQueue";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "failCause";
const exportKind = "const";
const moduleImportPath = "effect/TxQueue";
const sourceSummary = "Completes the queue with the specified exit value.";
const sourceExample =
  'import { Cause, Effect, TxQueue } from "effect"\n\nconst program = Effect.gen(function*() {\n  const queue = yield* TxQueue.bounded<number>(10)\n\n  // Complete with specific cause\n  const cause = Cause.interrupt()\n  const result = yield* TxQueue.failCause(queue, cause)\n  console.log(result) // true\n})';
const moduleRecord = TxQueueModule as Record<string, unknown>;

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
