/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Stream
 * Export: haltWhen
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Stream.ts
 * Generated: 2026-02-19T04:14:21.440Z
 *
 * Overview:
 * Halts evaluation after the current element once the provided effect completes; the effect is forked, its success is discarded, failures fail the stream, and it does not interrupt an in-progress pull (use `interruptWhen` for that).
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Deferred, Effect, Stream } from "effect"
 * 
 * const program = Effect.gen(function*() {
 *   const halt = yield* Deferred.make<void>()
 *   const values = yield* Stream.fromArray([1, 2, 3]).pipe(
 *     Stream.tap((value) => value === 2 ? Deferred.succeed(halt, void 0) : Effect.void),
 *     Stream.haltWhen(Deferred.await(halt)),
 *     Stream.runCollect
 *   )
 *   yield* Console.log(values)
 * })
 * 
 * Effect.runPromise(program)
 * // Output:
 * // [1, 2]
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
const exportName = "haltWhen";
const exportKind = "const";
const moduleImportPath = "effect/Stream";
const sourceSummary = "Halts evaluation after the current element once the provided effect completes; the effect is forked, its success is discarded, failures fail the stream, and it does not interrup...";
const sourceExample = "import { Console, Deferred, Effect, Stream } from \"effect\"\n\nconst program = Effect.gen(function*() {\n  const halt = yield* Deferred.make<void>()\n  const values = yield* Stream.fromArray([1, 2, 3]).pipe(\n    Stream.tap((value) => value === 2 ? Deferred.succeed(halt, void 0) : Effect.void),\n    Stream.haltWhen(Deferred.await(halt)),\n    Stream.runCollect\n  )\n  yield* Console.log(values)\n})\n\nEffect.runPromise(program)\n// Output:\n// [1, 2]";
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
