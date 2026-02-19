/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Stream
 * Export: drainFork
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Stream.ts
 * Generated: 2026-02-19T04:14:21.437Z
 *
 * Overview:
 * Runs the provided stream in the background while this stream runs, interrupting it when this stream completes and failing if the background stream fails or defects.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect, Stream } from "effect"
 * 
 * const foreground = Stream.make(1, 2)
 * const background = Stream.fromEffect(Console.log("background task"))
 * 
 * const program = Effect.gen(function*() {
 *   const values = yield* foreground.pipe(
 *     Stream.drainFork(background),
 *     Stream.runCollect
 *   )
 *   yield* Console.log(values)
 * })
 * 
 * Effect.runPromise(program)
 * // Output: background task
 * // Output: [ 1, 2 ]
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
const exportName = "drainFork";
const exportKind = "const";
const moduleImportPath = "effect/Stream";
const sourceSummary = "Runs the provided stream in the background while this stream runs, interrupting it when this stream completes and failing if the background stream fails or defects.";
const sourceExample = "import { Console, Effect, Stream } from \"effect\"\n\nconst foreground = Stream.make(1, 2)\nconst background = Stream.fromEffect(Console.log(\"background task\"))\n\nconst program = Effect.gen(function*() {\n  const values = yield* foreground.pipe(\n    Stream.drainFork(background),\n    Stream.runCollect\n  )\n  yield* Console.log(values)\n})\n\nEffect.runPromise(program)\n// Output: background task\n// Output: [ 1, 2 ]";
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
