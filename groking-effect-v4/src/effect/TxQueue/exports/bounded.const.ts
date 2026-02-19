/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/TxQueue
 * Export: bounded
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/TxQueue.ts
 * Generated: 2026-02-19T04:14:23.323Z
 *
 * Overview:
 * Creates a new bounded `TxQueue` with the specified capacity.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, TxQueue } from "effect"
 * 
 * const program = Effect.gen(function*() {
 *   // Create a bounded queue (E defaults to never)
 *   const queue = yield* TxQueue.bounded<number>(10)
 * 
 *   // Create a bounded queue with error channel
 *   const faultTolerantQueue = yield* TxQueue.bounded<number, string>(10)
 * 
 *   // Offer items - will succeed until capacity is reached
 *   yield* TxQueue.offer(queue, 1)
 *   yield* TxQueue.offer(queue, 2)
 * 
 *   const item = yield* TxQueue.take(queue)
 *   console.log(item) // 1
 * })
 * ```
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */
import * as Effect from "effect/Effect";
import * as Console from "effect/Console";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as TxQueueModule from "effect/TxQueue";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "bounded";
const exportKind = "const";
const moduleImportPath = "effect/TxQueue";
const sourceSummary = "Creates a new bounded `TxQueue` with the specified capacity.";
const sourceExample = "import { Effect, TxQueue } from \"effect\"\n\nconst program = Effect.gen(function*() {\n  // Create a bounded queue (E defaults to never)\n  const queue = yield* TxQueue.bounded<number>(10)\n\n  // Create a bounded queue with error channel\n  const faultTolerantQueue = yield* TxQueue.bounded<number, string>(10)\n\n  // Offer items - will succeed until capacity is reached\n  yield* TxQueue.offer(queue, 1)\n  yield* TxQueue.offer(queue, 2)\n\n  const item = yield* TxQueue.take(queue)\n  console.log(item) // 1\n})";
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
      run: exampleRuntimeInspection
    },
    {
      title: "Callable Value Probe",
      description: "Attempt a zero-arg invocation when the value is function-like.",
      run: exampleCallableProbe
    }
  ]
});

BunRuntime.runMain(program);
