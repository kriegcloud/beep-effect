/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Stream
 * Export: toPubSub
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Stream.ts
 * Generated: 2026-02-19T04:50:42.480Z
 *
 * Overview:
 * Converts a stream to a PubSub for concurrent consumption.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect, PubSub, Stream } from "effect"
 *
 * const program = Effect.scoped(Effect.gen(function* () {
 *   const pubsub = yield* Stream.fromArray([1, 2]).pipe(
 *     Stream.toPubSub({ capacity: 8 })
 *   )
 *   const subscription = yield* PubSub.subscribe(pubsub)
 *   const first = yield* PubSub.take(subscription)
 *
 *   yield* Console.log(first)
 * }))
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
import * as StreamModule from "effect/Stream";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "toPubSub";
const exportKind = "const";
const moduleImportPath = "effect/Stream";
const sourceSummary = "Converts a stream to a PubSub for concurrent consumption.";
const sourceExample =
  'import { Console, Effect, PubSub, Stream } from "effect"\n\nconst program = Effect.scoped(Effect.gen(function* () {\n  const pubsub = yield* Stream.fromArray([1, 2]).pipe(\n    Stream.toPubSub({ capacity: 8 })\n  )\n  const subscription = yield* PubSub.subscribe(pubsub)\n  const first = yield* PubSub.take(subscription)\n\n  yield* Console.log(first)\n}))';
const moduleRecord = StreamModule as Record<string, unknown>;

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
