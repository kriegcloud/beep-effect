/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Stream
 * Export: catchTag
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Stream.ts
 * Generated: 2026-02-19T04:50:42.444Z
 *
 * Overview:
 * Recovers from failures whose `_tag` matches the provided value by switching to the stream returned by `f`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Data, Effect, Stream } from "effect"
 *
 * class HttpError extends Data.TaggedError("HttpError")<{ message: string }> {}
 *
 * const stream = Stream.fail(new HttpError({ message: "timeout" }))
 *
 * const recovered = Stream.catchTag(stream, "HttpError", (error) =>
 *   Stream.make(`Recovered: ${error.message}`)
 * )
 *
 * const program = Effect.gen(function*() {
 *   const values = yield* Stream.runCollect(recovered)
 *   yield* Console.log(values)
 *   // Output: [ "Recovered: timeout" ]
 * })
 *
 * Effect.runPromise(program)
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
const exportName = "catchTag";
const exportKind = "const";
const moduleImportPath = "effect/Stream";
const sourceSummary =
  "Recovers from failures whose `_tag` matches the provided value by switching to the stream returned by `f`.";
const sourceExample =
  'import { Console, Data, Effect, Stream } from "effect"\n\nclass HttpError extends Data.TaggedError("HttpError")<{ message: string }> {}\n\nconst stream = Stream.fail(new HttpError({ message: "timeout" }))\n\nconst recovered = Stream.catchTag(stream, "HttpError", (error) =>\n  Stream.make(`Recovered: ${error.message}`)\n)\n\nconst program = Effect.gen(function*() {\n  const values = yield* Stream.runCollect(recovered)\n  yield* Console.log(values)\n  // Output: [ "Recovered: timeout" ]\n})\n\nEffect.runPromise(program)';
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
