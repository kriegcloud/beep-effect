/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Channel
 * Export: callbackArray
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Channel.ts
 * Generated: 2026-02-19T04:14:10.635Z
 *
 * Overview:
 * Creates a `Channel` that interacts with a callback function using a queue, emitting arrays.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Channel, Effect, Queue } from "effect"
 * 
 * const channel = Channel.callbackArray<number>(Effect.fn(function*(queue) {
 *   yield* Queue.offer(queue, 1)
 *   yield* Queue.offer(queue, 2)
 * }))
 * // Emits arrays of numbers instead of individual numbers
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
import * as ChannelModule from "effect/Channel";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "callbackArray";
const exportKind = "const";
const moduleImportPath = "effect/Channel";
const sourceSummary = "Creates a `Channel` that interacts with a callback function using a queue, emitting arrays.";
const sourceExample = "import { Channel, Effect, Queue } from \"effect\"\n\nconst channel = Channel.callbackArray<number>(Effect.fn(function*(queue) {\n  yield* Queue.offer(queue, 1)\n  yield* Queue.offer(queue, 2)\n}))\n// Emits arrays of numbers instead of individual numbers";
const moduleRecord = ChannelModule as Record<string, unknown>;

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
