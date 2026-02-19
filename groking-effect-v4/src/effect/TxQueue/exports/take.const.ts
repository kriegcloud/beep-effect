/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/TxQueue
 * Export: take
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/TxQueue.ts
 * Generated: 2026-02-19T04:14:23.324Z
 *
 * Overview:
 * Takes an item from the queue.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, TxQueue } from "effect"
 * 
 * const program = Effect.gen(function*() {
 *   const queue = yield* TxQueue.bounded<number, string>(10)
 *   yield* TxQueue.offer(queue, 42)
 * 
 *   // Take an item - blocks if empty
 *   const item = yield* TxQueue.take(queue)
 *   console.log(item) // 42
 * 
 *   // When queue fails, take fails with the same error
 *   yield* TxQueue.fail(queue, "queue error")
 *   const result = yield* Effect.flip(TxQueue.take(queue))
 *   console.log(result) // "queue error"
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
const exportName = "take";
const exportKind = "const";
const moduleImportPath = "effect/TxQueue";
const sourceSummary = "Takes an item from the queue.";
const sourceExample = "import { Effect, TxQueue } from \"effect\"\n\nconst program = Effect.gen(function*() {\n  const queue = yield* TxQueue.bounded<number, string>(10)\n  yield* TxQueue.offer(queue, 42)\n\n  // Take an item - blocks if empty\n  const item = yield* TxQueue.take(queue)\n  console.log(item) // 42\n\n  // When queue fails, take fails with the same error\n  yield* TxQueue.fail(queue, \"queue error\")\n  const result = yield* Effect.flip(TxQueue.take(queue))\n  console.log(result) // \"queue error\"\n})";
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
