/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/TxQueue
 * Export: unbounded
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/TxQueue.ts
 * Generated: 2026-02-19T04:14:23.324Z
 *
 * Overview:
 * Creates a new unbounded `TxQueue` with unlimited capacity.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, TxQueue } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   // Create an unbounded queue (E defaults to never)
 *   const queue = yield* TxQueue.unbounded<string>()
 *
 *   // Create an unbounded queue with error channel
 *   const faultTolerantQueue = yield* TxQueue.unbounded<string, Error>()
 *
 *   // Can offer unlimited items
 *   yield* TxQueue.offer(queue, "hello")
 *   yield* TxQueue.offer(queue, "world")
 *
 *   const size = yield* TxQueue.size(queue)
 *   console.log(size) // 2
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
const exportName = "unbounded";
const exportKind = "const";
const moduleImportPath = "effect/TxQueue";
const sourceSummary = "Creates a new unbounded `TxQueue` with unlimited capacity.";
const sourceExample =
  'import { Effect, TxQueue } from "effect"\n\nconst program = Effect.gen(function*() {\n  // Create an unbounded queue (E defaults to never)\n  const queue = yield* TxQueue.unbounded<string>()\n\n  // Create an unbounded queue with error channel\n  const faultTolerantQueue = yield* TxQueue.unbounded<string, Error>()\n\n  // Can offer unlimited items\n  yield* TxQueue.offer(queue, "hello")\n  yield* TxQueue.offer(queue, "world")\n\n  const size = yield* TxQueue.size(queue)\n  console.log(size) // 2\n})';
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
