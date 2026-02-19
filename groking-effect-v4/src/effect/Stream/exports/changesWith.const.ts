/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Stream
 * Export: changesWith
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Stream.ts
 * Generated: 2026-02-19T04:50:42.445Z
 *
 * Overview:
 * Returns a stream that only emits elements that are not equal to the previously emitted element, as determined by the specified predicate.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect, Stream } from "effect"
 *
 * const stream = Stream.make("A", "a", "B", "b", "b").pipe(
 *   Stream.changesWith((left, right) => left.toLowerCase() === right.toLowerCase())
 * )
 *
 * Effect.runPromise(
 *   Effect.gen(function*() {
 *     const values = yield* Stream.runCollect(stream)
 *     yield* Console.log(values)
 *   })
 * )
 * // ["A", "B"]
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
const exportName = "changesWith";
const exportKind = "const";
const moduleImportPath = "effect/Stream";
const sourceSummary =
  "Returns a stream that only emits elements that are not equal to the previously emitted element, as determined by the specified predicate.";
const sourceExample =
  'import { Console, Effect, Stream } from "effect"\n\nconst stream = Stream.make("A", "a", "B", "b", "b").pipe(\n  Stream.changesWith((left, right) => left.toLowerCase() === right.toLowerCase())\n)\n\nEffect.runPromise(\n  Effect.gen(function*() {\n    const values = yield* Stream.runCollect(stream)\n    yield* Console.log(values)\n  })\n)\n// ["A", "B"]';
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
