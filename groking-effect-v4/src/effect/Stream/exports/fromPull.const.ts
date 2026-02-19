/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Stream
 * Export: fromPull
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Stream.ts
 * Generated: 2026-02-19T04:50:42.452Z
 *
 * Overview:
 * Creates a stream from a pull effect, such as one produced by `Stream.toPull`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect, Stream } from "effect"
 *
 * const program = Effect.scoped(
 *   Effect.gen(function*() {
 *     const source = Stream.make(1, 2, 3)
 *     const pull = yield* Stream.toPull(source)
 *     const stream = Stream.fromPull(Effect.succeed(pull))
 *     const values = yield* Stream.runCollect(stream)
 *     yield* Console.log(values)
 *   })
 * )
 *
 * Effect.runPromise(program)
 * // Output: [1, 2, 3]
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
const exportName = "fromPull";
const exportKind = "const";
const moduleImportPath = "effect/Stream";
const sourceSummary = "Creates a stream from a pull effect, such as one produced by `Stream.toPull`.";
const sourceExample =
  'import { Console, Effect, Stream } from "effect"\n\nconst program = Effect.scoped(\n  Effect.gen(function*() {\n    const source = Stream.make(1, 2, 3)\n    const pull = yield* Stream.toPull(source)\n    const stream = Stream.fromPull(Effect.succeed(pull))\n    const values = yield* Stream.runCollect(stream)\n    yield* Console.log(values)\n  })\n)\n\nEffect.runPromise(program)\n// Output: [1, 2, 3]';
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
