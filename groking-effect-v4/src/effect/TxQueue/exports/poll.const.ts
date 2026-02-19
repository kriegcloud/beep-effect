/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/TxQueue
 * Export: poll
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/TxQueue.ts
 * Generated: 2026-02-19T04:50:44.331Z
 *
 * Overview:
 * Tries to take an item from the queue without blocking.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, Option, TxQueue } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const queue = yield* TxQueue.bounded<number>(10)
 *
 *   // Poll returns Option.none if empty
 *   const maybe = yield* TxQueue.poll(queue)
 *   console.log(Option.isNone(maybe)) // true
 *
 *   yield* TxQueue.offer(queue, 42)
 *   const item = yield* TxQueue.poll(queue)
 *   console.log(Option.getOrNull(item)) // 42
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
import * as TxQueueModule from "effect/TxQueue";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "poll";
const exportKind = "const";
const moduleImportPath = "effect/TxQueue";
const sourceSummary = "Tries to take an item from the queue without blocking.";
const sourceExample =
  'import { Effect, Option, TxQueue } from "effect"\n\nconst program = Effect.gen(function*() {\n  const queue = yield* TxQueue.bounded<number>(10)\n\n  // Poll returns Option.none if empty\n  const maybe = yield* TxQueue.poll(queue)\n  console.log(Option.isNone(maybe)) // true\n\n  yield* TxQueue.offer(queue, 42)\n  const item = yield* TxQueue.poll(queue)\n  console.log(Option.getOrNull(item)) // 42\n})';
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
