/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Stream
 * Export: tap
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Stream.ts
 * Generated: 2026-02-19T04:14:21.444Z
 *
 * Overview:
 * Runs the provided effect for each element while preserving the elements.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect, Stream } from "effect"
 * 
 * const program = Effect.gen(function*() {
 *   const result = yield* Stream.fromArray([1, 2, 3]).pipe(
 *     Stream.tap((n) => Console.log(`before mapping: ${n}`)),
 *     Stream.map((n) => n * 2),
 *     Stream.tap((n) => Console.log(`after mapping: ${n}`)),
 *     Stream.runCollect
 *   )
 * 
 *   yield* Console.log(result)
 * })
 * 
 * Effect.runPromise(program)
 * // Output:
 * // before mapping: 1
 * // after mapping: 2
 * // before mapping: 2
 * // after mapping: 4
 * // before mapping: 3
 * // after mapping: 6
 * // [ 2, 4, 6 ]
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
const exportName = "tap";
const exportKind = "const";
const moduleImportPath = "effect/Stream";
const sourceSummary = "Runs the provided effect for each element while preserving the elements.";
const sourceExample = "import { Console, Effect, Stream } from \"effect\"\n\nconst program = Effect.gen(function*() {\n  const result = yield* Stream.fromArray([1, 2, 3]).pipe(\n    Stream.tap((n) => Console.log(`before mapping: ${n}`)),\n    Stream.map((n) => n * 2),\n    Stream.tap((n) => Console.log(`after mapping: ${n}`)),\n    Stream.runCollect\n  )\n\n  yield* Console.log(result)\n})\n\nEffect.runPromise(program)\n// Output:\n// before mapping: 1\n// after mapping: 2\n// before mapping: 2\n// after mapping: 4\n// before mapping: 3\n// after mapping: 6\n// [ 2, 4, 6 ]";
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
