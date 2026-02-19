/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Stream
 * Export: partitionEffect
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Stream.ts
 * Generated: 2026-02-19T04:14:21.442Z
 *
 * Overview:
 * Splits a stream using an effectful filter, producing pass and fail streams.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect, Result, Stream } from "effect"
 *
 * const program = Effect.scoped(
 *   Effect.gen(function*() {
 *     const [evens, odds] = yield* Stream.make(1, 2, 3, 4).pipe(
 *       Stream.partitionEffect((n) =>
 *         Effect.succeed(n % 2 === 0 ? Result.succeed(n) : Result.fail(n))
 *       )
 *     )
 *     const result = yield* Effect.all({
 *       evens: Stream.runCollect(evens),
 *       odds: Stream.runCollect(odds)
 *     })
 *     yield* Console.log(result)
 *   })
 * )
 *
 * Effect.runPromise(program)
 * // Output: { evens: [ 2, 4 ], odds: [ 1, 3 ] }
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
const exportName = "partitionEffect";
const exportKind = "const";
const moduleImportPath = "effect/Stream";
const sourceSummary = "Splits a stream using an effectful filter, producing pass and fail streams.";
const sourceExample =
  'import { Console, Effect, Result, Stream } from "effect"\n\nconst program = Effect.scoped(\n  Effect.gen(function*() {\n    const [evens, odds] = yield* Stream.make(1, 2, 3, 4).pipe(\n      Stream.partitionEffect((n) =>\n        Effect.succeed(n % 2 === 0 ? Result.succeed(n) : Result.fail(n))\n      )\n    )\n    const result = yield* Effect.all({\n      evens: Stream.runCollect(evens),\n      odds: Stream.runCollect(odds)\n    })\n    yield* Console.log(result)\n  })\n)\n\nEffect.runPromise(program)\n// Output: { evens: [ 2, 4 ], odds: [ 1, 3 ] }';
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
