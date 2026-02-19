/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Stream
 * Export: updateService
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Stream.ts
 * Generated: 2026-02-19T04:14:21.445Z
 *
 * Overview:
 * Updates a single service in the stream environment by applying a function.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect, ServiceMap, Stream } from "effect"
 * 
 * class Counter extends ServiceMap.Service<Counter, { count: number }>()("Counter") {}
 * 
 * const stream = Stream.fromEffect(Effect.service(Counter)).pipe(
 *   Stream.updateService(Counter, (counter) => ({ count: counter.count + 1 }))
 * )
 * 
 * const program = Effect.gen(function*() {
 *   const counters = yield* Stream.runCollect(stream)
 *   yield* Console.log(`Updated count: ${counters[0].count}`)
 * })
 * 
 * Effect.runPromise(Effect.provideService(program, Counter, { count: 0 }))
 * // Output: Updated count: 1
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
const exportName = "updateService";
const exportKind = "const";
const moduleImportPath = "effect/Stream";
const sourceSummary = "Updates a single service in the stream environment by applying a function.";
const sourceExample = "import { Console, Effect, ServiceMap, Stream } from \"effect\"\n\nclass Counter extends ServiceMap.Service<Counter, { count: number }>()(\"Counter\") {}\n\nconst stream = Stream.fromEffect(Effect.service(Counter)).pipe(\n  Stream.updateService(Counter, (counter) => ({ count: counter.count + 1 }))\n)\n\nconst program = Effect.gen(function*() {\n  const counters = yield* Stream.runCollect(stream)\n  yield* Console.log(`Updated count: ${counters[0].count}`)\n})\n\nEffect.runPromise(Effect.provideService(program, Counter, { count: 0 }))\n// Output: Updated count: 1";
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
