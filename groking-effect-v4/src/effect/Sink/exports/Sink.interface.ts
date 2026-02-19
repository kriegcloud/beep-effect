/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Sink
 * Export: Sink
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/Sink.ts
 * Generated: 2026-02-19T04:50:40.916Z
 *
 * Overview:
 * A `Sink<A, In, L, E, R>` is used to consume elements produced by a `Stream`. You can think of a sink as a function that will consume a variable amount of `In` elements (could be 0, 1, or many), might fail with an error of type `E`, and will eventually yield a value of type `A` together with a remainder of type `L` (i.e. any leftovers).
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect } from "effect"
 * import * as Sink from "effect/Sink"
 * import * as Stream from "effect/Stream"
 *
 * // Create a simple sink that always succeeds with a value
 * const sink: Sink.Sink<number> = Sink.succeed(42)
 *
 * // Use the sink to consume a stream
 * const stream = Stream.make(1, 2, 3)
 * const program = Stream.run(stream, sink)
 *
 * Effect.runPromise(program).then(console.log)
 * // Output: 42
 * ```
 *
 * Focus:
 * - Type-only exports (`type`, `interface`) are erased at runtime.
 * - Runtime examples still provide module-level context for learning.
 */

import {
  createPlaygroundProgram,
  inspectNamedExport,
  inspectTypeLikeExport,
} from "@beep/groking-effect-v4/runtime/Playground";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as SinkModule from "effect/Sink";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "Sink";
const exportKind = "interface";
const moduleImportPath = "effect/Sink";
const sourceSummary =
  "A `Sink<A, In, L, E, R>` is used to consume elements produced by a `Stream`. You can think of a sink as a function that will consume a variable amount of `In` elements (could be...";
const sourceExample =
  'import { Effect } from "effect"\nimport * as Sink from "effect/Sink"\nimport * as Stream from "effect/Stream"\n\n// Create a simple sink that always succeeds with a value\nconst sink: Sink.Sink<number> = Sink.succeed(42)\n\n// Use the sink to consume a stream\nconst stream = Stream.make(1, 2, 3)\nconst program = Stream.run(stream, sink)\n\nEffect.runPromise(program).then(console.log)\n// Output: 42';
const moduleRecord = SinkModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleTypeRuntimeCheck = Effect.gen(function* () {
  yield* Console.log("Check runtime visibility for this type/interface export.");
  yield* inspectTypeLikeExport({ moduleRecord, exportName });
});

const exampleModuleContextInspection = Effect.gen(function* () {
  yield* Console.log("Inspect runtime module context around this type-like export.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

/* ========================================================================== *
 * Program
 * ========================================================================== */
const program = createPlaygroundProgram({
  icon: "🧠",
  moduleImportPath,
  exportName,
  exportKind,
  summary: sourceSummary,
  sourceExample,
  examples: [
    {
      title: "Type Erasure Check",
      description: "Confirm whether this symbol appears at runtime.",
      run: exampleTypeRuntimeCheck,
    },
    {
      title: "Module Context Inspection",
      description: "Inspect the runtime module value for additional context.",
      run: exampleModuleContextInspection,
    },
  ],
});

BunRuntime.runMain(program);
