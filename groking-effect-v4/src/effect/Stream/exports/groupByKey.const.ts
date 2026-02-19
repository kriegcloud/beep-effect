/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Stream
 * Export: groupByKey
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Stream.ts
 * Generated: 2026-02-19T04:50:42.453Z
 *
 * Overview:
 * Groups elements by a key and emits a stream per key.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect, Stream } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const grouped = yield* Stream.make(1, 2, 3, 4, 5).pipe(
 *     Stream.groupByKey((n) => n % 2 === 0 ? "even" : "odd"),
 *     Stream.mapEffect(
 *       ([key, stream]) =>
 *         Stream.runCollect(stream).pipe(
 *           Effect.map((values) => [key, values] as const)
 *         ),
 *       { concurrency: "unbounded" }
 *     ),
 *     Stream.runCollect
 *   )
 *   yield* Console.log(grouped)
 * })
 *
 * Effect.runPromise(program)
 * // Output: [ [ "odd", [ 1, 3, 5 ] ], [ "even", [ 2, 4 ] ] ]
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
const exportName = "groupByKey";
const exportKind = "const";
const moduleImportPath = "effect/Stream";
const sourceSummary = "Groups elements by a key and emits a stream per key.";
const sourceExample =
  'import { Console, Effect, Stream } from "effect"\n\nconst program = Effect.gen(function*() {\n  const grouped = yield* Stream.make(1, 2, 3, 4, 5).pipe(\n    Stream.groupByKey((n) => n % 2 === 0 ? "even" : "odd"),\n    Stream.mapEffect(\n      ([key, stream]) =>\n        Stream.runCollect(stream).pipe(\n          Effect.map((values) => [key, values] as const)\n        ),\n      { concurrency: "unbounded" }\n    ),\n    Stream.runCollect\n  )\n  yield* Console.log(grouped)\n})\n\nEffect.runPromise(program)\n// Output: [ [ "odd", [ 1, 3, 5 ] ], [ "even", [ 2, 4 ] ] ]';
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
