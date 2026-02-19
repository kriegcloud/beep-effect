/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Stream
 * Export: share
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Stream.ts
 * Generated: 2026-02-19T04:14:21.443Z
 *
 * Overview:
 * Returns a new Stream that multicasts the original stream, subscribing when the first consumer starts.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect, Stream } from "effect"
 *
 * Effect.runPromise(
 *   Effect.scoped(
 *     Effect.gen(function*() {
 *       const shared = yield* Stream.make(1, 2, 3).pipe(
 *         Stream.share({ capacity: 16 })
 *       )
 *
 *       const first = yield* shared.pipe(Stream.take(1), Stream.runCollect)
 *       const second = yield* shared.pipe(Stream.take(1), Stream.runCollect)
 *
 *       yield* Console.log([first, second])
 *     })
 *   )
 * )
 * // output: [[1], [1]]
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
const exportName = "share";
const exportKind = "const";
const moduleImportPath = "effect/Stream";
const sourceSummary =
  "Returns a new Stream that multicasts the original stream, subscribing when the first consumer starts.";
const sourceExample =
  'import { Console, Effect, Stream } from "effect"\n\nEffect.runPromise(\n  Effect.scoped(\n    Effect.gen(function*() {\n      const shared = yield* Stream.make(1, 2, 3).pipe(\n        Stream.share({ capacity: 16 })\n      )\n\n      const first = yield* shared.pipe(Stream.take(1), Stream.runCollect)\n      const second = yield* shared.pipe(Stream.take(1), Stream.runCollect)\n\n      yield* Console.log([first, second])\n    })\n  )\n)\n// output: [[1], [1]]';
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
