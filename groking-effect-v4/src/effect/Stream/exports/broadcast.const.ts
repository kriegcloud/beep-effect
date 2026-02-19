/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Stream
 * Export: broadcast
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Stream.ts
 * Generated: 2026-02-19T04:50:42.444Z
 *
 * Overview:
 * Creates a PubSub-backed stream that multicasts the source to all subscribers.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect, Stream } from "effect"
 *
 * const program = Effect.scoped(
 *   Effect.gen(function* () {
 *     const broadcasted = yield* Stream.broadcast(Stream.fromArray([1, 2, 3]), {
 *       capacity: 8,
 *       replay: 3
 *     })
 *
 *     const [left, right] = yield* Effect.all([
 *       Stream.runCollect(broadcasted),
 *       Stream.runCollect(broadcasted)
 *     ], { concurrency: "unbounded" })
 *
 *     yield* Console.log([left, right])
 *   })
 * )
 *
 * Effect.runPromise(program)
 * // Output: [[1, 2, 3], [1, 2, 3]]
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
const exportName = "broadcast";
const exportKind = "const";
const moduleImportPath = "effect/Stream";
const sourceSummary = "Creates a PubSub-backed stream that multicasts the source to all subscribers.";
const sourceExample =
  'import { Console, Effect, Stream } from "effect"\n\nconst program = Effect.scoped(\n  Effect.gen(function* () {\n    const broadcasted = yield* Stream.broadcast(Stream.fromArray([1, 2, 3]), {\n      capacity: 8,\n      replay: 3\n    })\n\n    const [left, right] = yield* Effect.all([\n      Stream.runCollect(broadcasted),\n      Stream.runCollect(broadcasted)\n    ], { concurrency: "unbounded" })\n\n    yield* Console.log([left, right])\n  })\n)\n\nEffect.runPromise(program)\n// Output: [[1, 2, 3], [1, 2, 3]]';
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
