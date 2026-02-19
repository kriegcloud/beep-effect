/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Stream
 * Export: partitionQueue
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Stream.ts
 * Generated: 2026-02-19T04:14:21.442Z
 *
 * Overview:
 * Partitions a stream using a Filter and exposes passing and failing values as queues.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect, Filter, Result, Stream } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const [passes, fails] = yield* Stream.make(1, 2, 3, 4).pipe(
 *     Stream.partitionQueue(
 *       Filter.make((n) => (n % 2 === 0 ? Result.succeed(n) : Result.fail(n)))
 *     )
 *   )
 *
 *   const passValues = yield* Stream.fromQueue(passes).pipe(Stream.runCollect)
 *   const failValues = yield* Stream.fromQueue(fails).pipe(Stream.runCollect)
 *
 *   yield* Console.log(passValues)
 *   // Output: [ 2, 4 ]
 *   yield* Console.log(failValues)
 *   // Output: [ 1, 3 ]
 * })
 *
 * Effect.runPromise(Effect.scoped(program))
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
import * as StreamModule from "effect/Stream";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "partitionQueue";
const exportKind = "const";
const moduleImportPath = "effect/Stream";
const sourceSummary = "Partitions a stream using a Filter and exposes passing and failing values as queues.";
const sourceExample =
  'import { Console, Effect, Filter, Result, Stream } from "effect"\n\nconst program = Effect.gen(function*() {\n  const [passes, fails] = yield* Stream.make(1, 2, 3, 4).pipe(\n    Stream.partitionQueue(\n      Filter.make((n) => (n % 2 === 0 ? Result.succeed(n) : Result.fail(n)))\n    )\n  )\n\n  const passValues = yield* Stream.fromQueue(passes).pipe(Stream.runCollect)\n  const failValues = yield* Stream.fromQueue(fails).pipe(Stream.runCollect)\n\n  yield* Console.log(passValues)\n  // Output: [ 2, 4 ]\n  yield* Console.log(failValues)\n  // Output: [ 1, 3 ]\n})\n\nEffect.runPromise(Effect.scoped(program))';
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
