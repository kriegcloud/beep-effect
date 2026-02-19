/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Layer
 * Export: fresh
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Layer.ts
 * Generated: 2026-02-19T04:50:37.314Z
 *
 * Overview:
 * Creates a fresh version of this layer that will not be shared.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, Layer, Ref, ServiceMap } from "effect"
 *
 * class Counter extends ServiceMap.Service<Counter, {
 *   readonly count: number
 *   readonly increment: () => Effect.Effect<number>
 * }>()("Counter") {}
 *
 * // Layer that creates a counter with shared state
 * const counterLayer = Layer.effect(Counter)(Effect.gen(function*() {
 *   const ref = yield* Ref.make(0)
 *   return {
 *     count: 0,
 *     increment: () =>
 *       Ref.update(ref, (n) => n + 1).pipe(
 *         Effect.flatMap(() => Ref.get(ref))
 *       )
 *   }
 * }))
 *
 * // By default, layers are shared - same instance used everywhere
 * const sharedProgram = Effect.gen(function*() {
 *   const counter1 = yield* Counter
 *   const counter2 = yield* Counter
 *
 *   // Both counter1 and counter2 refer to the same instance
 *   console.log("Shared layer - same instance")
 * }).pipe(
 *   Effect.provide(counterLayer)
 * )
 *
 * // Fresh layer creates a new instance each time
 * const freshProgram = Effect.gen(function*() {
 *   const counter1 = yield* Counter
 *   const counter2 = yield* Counter
 *
 *   // counter1 and counter2 are different instances
 *   console.log("Fresh layer - different instances")
 * }).pipe(
 *   Effect.provide(Layer.fresh(counterLayer))
 * )
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
import * as LayerModule from "effect/Layer";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "fresh";
const exportKind = "const";
const moduleImportPath = "effect/Layer";
const sourceSummary = "Creates a fresh version of this layer that will not be shared.";
const sourceExample =
  'import { Effect, Layer, Ref, ServiceMap } from "effect"\n\nclass Counter extends ServiceMap.Service<Counter, {\n  readonly count: number\n  readonly increment: () => Effect.Effect<number>\n}>()("Counter") {}\n\n// Layer that creates a counter with shared state\nconst counterLayer = Layer.effect(Counter)(Effect.gen(function*() {\n  const ref = yield* Ref.make(0)\n  return {\n    count: 0,\n    increment: () =>\n      Ref.update(ref, (n) => n + 1).pipe(\n        Effect.flatMap(() => Ref.get(ref))\n      )\n  }\n}))\n\n// By default, layers are shared - same instance used everywhere\nconst sharedProgram = Effect.gen(function*() {\n  const counter1 = yield* Counter\n  const counter2 = yield* Counter\n\n  // Both counter1 and counter2 refer to the same instance\n  console.log("Shared layer - same instance")\n}).pipe(\n  Effect.provide(counterLayer)\n)\n\n// Fresh layer creates a new instance each time\nconst freshProgram = Effect.gen(function*() {\n  const counter1 = yield* Counter\n  const counter2 = yield* Counter\n\n  // counter1 and counter2 are different instances\n  console.log("Fresh layer - different instances")\n}).pipe(\n  Effect.provide(Layer.fresh(counterLayer))\n)';
const moduleRecord = LayerModule as Record<string, unknown>;

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
