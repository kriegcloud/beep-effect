/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Stream
 * Export: Stream
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/Stream.ts
 * Generated: 2026-02-19T04:14:21.444Z
 *
 * Overview:
 * A `Stream<A, E, R>` describes a program that can emit many `A` values, fail with `E`, and require `R`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect, Stream } from "effect"
 * 
 * const program = Effect.gen(function*() {
 *   yield* Stream.make(1, 2, 3).pipe(
 *     Stream.map((n) => n * 2),
 *     Stream.runForEach((n) => Console.log(n))
 *   )
 * })
 * 
 * Effect.runPromise(program)
 * // Output:
 * // 2
 * // 4
 * // 6
 * ```
 *
 * Focus:
 * - Type-only exports (`type`, `interface`) are erased at runtime.
 * - Runtime examples still provide module-level context for learning.
 */
import * as Effect from "effect/Effect";
import * as Console from "effect/Console";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as StreamModule from "effect/Stream";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  inspectTypeLikeExport
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "Stream";
const exportKind = "interface";
const moduleImportPath = "effect/Stream";
const sourceSummary = "A `Stream<A, E, R>` describes a program that can emit many `A` values, fail with `E`, and require `R`.";
const sourceExample = "import { Console, Effect, Stream } from \"effect\"\n\nconst program = Effect.gen(function*() {\n  yield* Stream.make(1, 2, 3).pipe(\n    Stream.map((n) => n * 2),\n    Stream.runForEach((n) => Console.log(n))\n  )\n})\n\nEffect.runPromise(program)\n// Output:\n// 2\n// 4\n// 6";
const moduleRecord = StreamModule as Record<string, unknown>;

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
  bunContext: BunContext,
  examples: [
    {
      title: "Type Erasure Check",
      description: "Confirm whether this symbol appears at runtime.",
      run: exampleTypeRuntimeCheck
    },
    {
      title: "Module Context Inspection",
      description: "Inspect the runtime module value for additional context.",
      run: exampleModuleContextInspection
    }
  ]
});

BunRuntime.runMain(program);
