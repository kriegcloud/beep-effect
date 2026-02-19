/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/TxQueue
 * Export: isTxDequeue
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/TxQueue.ts
 * Generated: 2026-02-19T04:14:23.323Z
 *
 * Overview:
 * Checks if the given value is a TxDequeue.
 *
 * Source JSDoc Example:
 * ```ts
 * import { TxQueue } from "effect"
 * 
 * declare const someValue: unknown
 * 
 * if (TxQueue.isTxDequeue(someValue)) {
 *   // someValue is now typed as TxDequeue<unknown, unknown>
 *   console.log("This is a TxDequeue")
 * }
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
const exportName = "isTxDequeue";
const exportKind = "const";
const moduleImportPath = "effect/TxQueue";
const sourceSummary = "Checks if the given value is a TxDequeue.";
const sourceExample = "import { TxQueue } from \"effect\"\n\ndeclare const someValue: unknown\n\nif (TxQueue.isTxDequeue(someValue)) {\n  // someValue is now typed as TxDequeue<unknown, unknown>\n  console.log(\"This is a TxDequeue\")\n}";
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
