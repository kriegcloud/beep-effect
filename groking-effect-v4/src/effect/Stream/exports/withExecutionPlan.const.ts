/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Stream
 * Export: withExecutionPlan
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Stream.ts
 * Generated: 2026-02-19T04:50:42.482Z
 *
 * Overview:
 * Apply an `ExecutionPlan` to a stream, retrying with step-provided resources until it succeeds or the plan is exhausted.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect, ExecutionPlan, Layer, ServiceMap, Stream } from "effect"
 *
 * class Service extends ServiceMap.Service<Service>()("Service", {
 *   make: Effect.succeed({
 *     stream: Stream.fail("A") as Stream.Stream<number, string>
 *   })
 * }) {
 *   static Bad = Layer.succeed(Service, Service.of({ stream: Stream.fail("A") }))
 *   static Good = Layer.succeed(Service, Service.of({ stream: Stream.make(1, 2, 3) }))
 * }
 *
 * const plan = ExecutionPlan.make(
 *   { provide: Service.Bad },
 *   { provide: Service.Good }
 * )
 *
 * const stream = Stream.unwrap(Effect.map(Service.asEffect(), (_) => _.stream))
 *
 * const program = Effect.gen(function*() {
 *   const items = yield* stream.pipe(Stream.withExecutionPlan(plan), Stream.runCollect)
 *   yield* Console.log(items)
 * })
 *
 * Effect.runPromise(program)
 * // Output: [ 1, 2, 3 ]
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
const exportName = "withExecutionPlan";
const exportKind = "const";
const moduleImportPath = "effect/Stream";
const sourceSummary =
  "Apply an `ExecutionPlan` to a stream, retrying with step-provided resources until it succeeds or the plan is exhausted.";
const sourceExample =
  'import { Console, Effect, ExecutionPlan, Layer, ServiceMap, Stream } from "effect"\n\nclass Service extends ServiceMap.Service<Service>()("Service", {\n  make: Effect.succeed({\n    stream: Stream.fail("A") as Stream.Stream<number, string>\n  })\n}) {\n  static Bad = Layer.succeed(Service, Service.of({ stream: Stream.fail("A") }))\n  static Good = Layer.succeed(Service, Service.of({ stream: Stream.make(1, 2, 3) }))\n}\n\nconst plan = ExecutionPlan.make(\n  { provide: Service.Bad },\n  { provide: Service.Good }\n)\n\nconst stream = Stream.unwrap(Effect.map(Service.asEffect(), (_) => _.stream))\n\nconst program = Effect.gen(function*() {\n  const items = yield* stream.pipe(Stream.withExecutionPlan(plan), Stream.runCollect)\n  yield* Console.log(items)\n})\n\nEffect.runPromise(program)\n// Output: [ 1, 2, 3 ]';
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
