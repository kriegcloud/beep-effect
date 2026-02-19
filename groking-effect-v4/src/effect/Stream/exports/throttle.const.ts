/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Stream
 * Export: throttle
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Stream.ts
 * Generated: 2026-02-19T04:14:21.445Z
 *
 * Overview:
 * Delays the arrays of this stream using a token bucket and a per-array cost. Allows bursts by letting the bucket accumulate up to a `units + burst` threshold. The weight of each array is determined by the `cost` function.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect, Schedule, Stream } from "effect"
 * 
 * const stream = Stream.fromSchedule(Schedule.spaced("50 millis")).pipe(
 *   Stream.take(6),
 *   Stream.throttle({
 *     cost: (arr) => arr.length,
 *     units: 1,
 *     duration: "100 millis",
 *     strategy: "shape"
 *   })
 * )
 * 
 * const program = Effect.gen(function*() {
 *   const values = yield* Stream.runCollect(stream)
 *   yield* Console.log(values)
 *   // Output: [ 0, 1, 2, 3, 4, 5 ]
 * })
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
const exportName = "throttle";
const exportKind = "const";
const moduleImportPath = "effect/Stream";
const sourceSummary = "Delays the arrays of this stream using a token bucket and a per-array cost. Allows bursts by letting the bucket accumulate up to a `units + burst` threshold. The weight of each ...";
const sourceExample = "import { Console, Effect, Schedule, Stream } from \"effect\"\n\nconst stream = Stream.fromSchedule(Schedule.spaced(\"50 millis\")).pipe(\n  Stream.take(6),\n  Stream.throttle({\n    cost: (arr) => arr.length,\n    units: 1,\n    duration: \"100 millis\",\n    strategy: \"shape\"\n  })\n)\n\nconst program = Effect.gen(function*() {\n  const values = yield* Stream.runCollect(stream)\n  yield* Console.log(values)\n  // Output: [ 0, 1, 2, 3, 4, 5 ]\n})";
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
