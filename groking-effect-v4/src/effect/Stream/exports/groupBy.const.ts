/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Stream
 * Export: groupBy
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Stream.ts
 * Generated: 2026-02-19T04:14:21.439Z
 *
 * Overview:
 * Groups elements into keyed substreams using an effectful classifier.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect, Stream } from "effect"
 * 
 * const program = Effect.gen(function*() {
 *   const grouped = yield* Stream.make(1, 2, 3, 4, 5).pipe(
 *     Stream.groupBy((n) =>
 *       Effect.succeed([n % 2 === 0 ? "even" : "odd", n] as const)
 *     ),
 *     Stream.mapEffect(
 *       Effect.fnUntraced(function*([key, stream]) {
 *         return [key, yield* Stream.runCollect(stream)] as const
 *       }),
 *       { concurrency: "unbounded" }
 *     ),
 *     Stream.runCollect
 *   )
 * 
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
import * as Effect from "effect/Effect";
import * as Console from "effect/Console";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as StreamModule from "effect/Stream";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "groupBy";
const exportKind = "const";
const moduleImportPath = "effect/Stream";
const sourceSummary = "Groups elements into keyed substreams using an effectful classifier.";
const sourceExample = "import { Console, Effect, Stream } from \"effect\"\n\nconst program = Effect.gen(function*() {\n  const grouped = yield* Stream.make(1, 2, 3, 4, 5).pipe(\n    Stream.groupBy((n) =>\n      Effect.succeed([n % 2 === 0 ? \"even\" : \"odd\", n] as const)\n    ),\n    Stream.mapEffect(\n      Effect.fnUntraced(function*([key, stream]) {\n        return [key, yield* Stream.runCollect(stream)] as const\n      }),\n      { concurrency: \"unbounded\" }\n    ),\n    Stream.runCollect\n  )\n\n  yield* Console.log(grouped)\n})\n\nEffect.runPromise(program)\n// Output: [ [ \"odd\", [ 1, 3, 5 ] ], [ \"even\", [ 2, 4 ] ] ]";
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
