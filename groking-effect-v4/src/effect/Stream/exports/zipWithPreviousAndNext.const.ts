/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Stream
 * Export: zipWithPreviousAndNext
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Stream.ts
 * Generated: 2026-02-19T04:14:21.446Z
 *
 * Overview:
 * Zips each element with its previous and next values.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect, Option, Stream } from "effect"
 * 
 * const program = Effect.gen(function*() {
 *   const values = yield* Stream.make(1, 2, 3).pipe(
 *     Stream.zipWithPreviousAndNext,
 *     Stream.runCollect
 *   )
 *   yield* Console.log(values)
 * })
 * 
 * Effect.runPromise(program)
 * // Output: [ [Option.none(), 1, Option.some(2)], [Option.some(1), 2, Option.some(3)], [Option.some(2), 3, Option.none()] ]
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
const exportName = "zipWithPreviousAndNext";
const exportKind = "const";
const moduleImportPath = "effect/Stream";
const sourceSummary = "Zips each element with its previous and next values.";
const sourceExample = "import { Console, Effect, Option, Stream } from \"effect\"\n\nconst program = Effect.gen(function*() {\n  const values = yield* Stream.make(1, 2, 3).pipe(\n    Stream.zipWithPreviousAndNext,\n    Stream.runCollect\n  )\n  yield* Console.log(values)\n})\n\nEffect.runPromise(program)\n// Output: [ [Option.none(), 1, Option.some(2)], [Option.some(1), 2, Option.some(3)], [Option.some(2), 3, Option.none()] ]";
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
