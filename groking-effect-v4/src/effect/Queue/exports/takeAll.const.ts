/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Queue
 * Export: takeAll
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Queue.ts
 * Generated: 2026-02-19T04:14:16.042Z
 *
 * Overview:
 * Take all messages from the queue, or wait for messages to be available.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Cause, Effect, Queue } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const queue = yield* Queue.bounded<number, Cause.Done>(5)
 *
 *   // Add several messages
 *   yield* Queue.offerAll(queue, [1, 2, 3, 4, 5])
 *
 *   // Take all available messages
 *   const messages1 = yield* Queue.takeAll(queue)
 *   console.log(messages1) // [1, 2, 3, 4, 5]
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
import * as QueueModule from "effect/Queue";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "takeAll";
const exportKind = "const";
const moduleImportPath = "effect/Queue";
const sourceSummary = "Take all messages from the queue, or wait for messages to be available.";
const sourceExample =
  'import { Cause, Effect, Queue } from "effect"\n\nconst program = Effect.gen(function*() {\n  const queue = yield* Queue.bounded<number, Cause.Done>(5)\n\n  // Add several messages\n  yield* Queue.offerAll(queue, [1, 2, 3, 4, 5])\n\n  // Take all available messages\n  const messages1 = yield* Queue.takeAll(queue)\n  console.log(messages1) // [1, 2, 3, 4, 5]\n})';
const moduleRecord = QueueModule as Record<string, unknown>;

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
