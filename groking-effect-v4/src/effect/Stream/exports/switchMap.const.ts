/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Stream
 * Export: switchMap
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Stream.ts
 * Generated: 2026-02-19T04:14:21.444Z
 *
 * Overview:
 * Switches to the latest stream produced by the mapping function, interrupting the previous stream when a new element arrives.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect, Stream } from "effect"
 * 
 * const program = Stream.make(1, 2, 3).pipe(
 *   Stream.switchMap((n) => (n === 3 ? Stream.make(n) : Stream.never)),
 *   Stream.runCollect
 * )
 * 
 * Effect.gen(function*() {
 *   const result = yield* program
 *   yield* Console.log(result)
 *   // Output: [ 3 ]
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
const exportName = "switchMap";
const exportKind = "const";
const moduleImportPath = "effect/Stream";
const sourceSummary = "Switches to the latest stream produced by the mapping function, interrupting the previous stream when a new element arrives.";
const sourceExample = "import { Console, Effect, Stream } from \"effect\"\n\nconst program = Stream.make(1, 2, 3).pipe(\n  Stream.switchMap((n) => (n === 3 ? Stream.make(n) : Stream.never)),\n  Stream.runCollect\n)\n\nEffect.gen(function*() {\n  const result = yield* program\n  yield* Console.log(result)\n  // Output: [ 3 ]\n})";
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
