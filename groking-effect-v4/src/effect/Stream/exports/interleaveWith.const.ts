/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Stream
 * Export: interleaveWith
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Stream.ts
 * Generated: 2026-02-19T04:14:21.440Z
 *
 * Overview:
 * Interleaves two streams deterministically by following a boolean decider stream.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect, Stream } from "effect"
 * 
 * const program = Effect.gen(function*() {
 *   const left = Stream.make(1, 3, 5)
 *   const right = Stream.make(2, 4, 6)
 *   const decider = Stream.make(true, false, false, true, true)
 * 
 *   const values = yield* Stream.runCollect(
 *     Stream.interleaveWith(left, right, decider)
 *   )
 * 
 *   yield* Console.log(values)
 * })
 * 
 * Effect.runPromise(program)
 * // [ 1, 2, 4, 3, 5 ]
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
const exportName = "interleaveWith";
const exportKind = "const";
const moduleImportPath = "effect/Stream";
const sourceSummary = "Interleaves two streams deterministically by following a boolean decider stream.";
const sourceExample = "import { Console, Effect, Stream } from \"effect\"\n\nconst program = Effect.gen(function*() {\n  const left = Stream.make(1, 3, 5)\n  const right = Stream.make(2, 4, 6)\n  const decider = Stream.make(true, false, false, true, true)\n\n  const values = yield* Stream.runCollect(\n    Stream.interleaveWith(left, right, decider)\n  )\n\n  yield* Console.log(values)\n})\n\nEffect.runPromise(program)\n// [ 1, 2, 4, 3, 5 ]";
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
