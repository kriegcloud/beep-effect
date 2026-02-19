/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/TxQueue
 * Export: isTxQueue
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/TxQueue.ts
 * Generated: 2026-02-19T04:50:44.331Z
 *
 * Overview:
 * Checks if the given value is a TxQueue.
 *
 * Source JSDoc Example:
 * ```ts
 * import { TxQueue } from "effect"
 *
 * declare const someValue: unknown
 *
 * if (TxQueue.isTxQueue(someValue)) {
 *   // someValue is now typed as TxQueue<unknown, unknown>
 *   console.log("This is a TxQueue")
 * }
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
const exportName = "isTxQueue";
const exportKind = "const";
const moduleImportPath = "effect/TxQueue";
const sourceSummary = "Checks if the given value is a TxQueue.";
const sourceExample =
  'import { TxQueue } from "effect"\n\ndeclare const someValue: unknown\n\nif (TxQueue.isTxQueue(someValue)) {\n  // someValue is now typed as TxQueue<unknown, unknown>\n  console.log("This is a TxQueue")\n}';
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
