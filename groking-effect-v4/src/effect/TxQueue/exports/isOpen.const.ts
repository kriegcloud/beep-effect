/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/TxQueue
 * Export: isOpen
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/TxQueue.ts
 * Generated: 2026-02-19T04:14:23.323Z
 *
 * Overview:
 * Checks if the queue is in the open state.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, TxQueue } from "effect"
 * 
 * const program = Effect.gen(function*() {
 *   const queue = yield* TxQueue.bounded<number>(10)
 * 
 *   const open = yield* TxQueue.isOpen(queue)
 *   console.log(open) // true
 * 
 *   yield* TxQueue.interrupt(queue)
 *   const stillOpen = yield* TxQueue.isOpen(queue)
 *   console.log(stillOpen) // false
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
const exportName = "isOpen";
const exportKind = "const";
const moduleImportPath = "effect/TxQueue";
const sourceSummary = "Checks if the queue is in the open state.";
const sourceExample = "import { Effect, TxQueue } from \"effect\"\n\nconst program = Effect.gen(function*() {\n  const queue = yield* TxQueue.bounded<number>(10)\n\n  const open = yield* TxQueue.isOpen(queue)\n  console.log(open) // true\n\n  yield* TxQueue.interrupt(queue)\n  const stillOpen = yield* TxQueue.isOpen(queue)\n  console.log(stillOpen) // false\n})";
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
