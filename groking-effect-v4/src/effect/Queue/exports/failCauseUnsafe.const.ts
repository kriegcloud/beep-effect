/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Queue
 * Export: failCauseUnsafe
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Queue.ts
 * Generated: 2026-02-19T04:14:16.041Z
 *
 * Overview:
 * Fail the queue with a cause synchronously. If the queue is already done, `false` is returned.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, Cause } from "effect"
 * import { Queue } from "effect"
 * 
 * const program = Effect.gen(function*() {
 *   const queue = yield* Queue.bounded<number, string>(10)
 * 
 *   // Add some messages
 *   Queue.offerUnsafe(queue, 1)
 * 
 *   // Create a cause and fail the queue synchronously
 *   const cause = Cause.fail("Processing error")
 *   const failed = Queue.failCauseUnsafe(queue, cause)
 *   console.log(failed) // true
 * 
 *   // The queue is now in failed state
 *   console.log(queue.state._tag) // "Done"
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
import * as QueueModule from "effect/Queue";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "failCauseUnsafe";
const exportKind = "const";
const moduleImportPath = "effect/Queue";
const sourceSummary = "Fail the queue with a cause synchronously. If the queue is already done, `false` is returned.";
const sourceExample = "import { Effect, Cause } from \"effect\"\nimport { Queue } from \"effect\"\n\nconst program = Effect.gen(function*() {\n  const queue = yield* Queue.bounded<number, string>(10)\n\n  // Add some messages\n  Queue.offerUnsafe(queue, 1)\n\n  // Create a cause and fail the queue synchronously\n  const cause = Cause.fail(\"Processing error\")\n  const failed = Queue.failCauseUnsafe(queue, cause)\n  console.log(failed) // true\n\n  // The queue is now in failed state\n  console.log(queue.state._tag) // \"Done\"\n})";
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
