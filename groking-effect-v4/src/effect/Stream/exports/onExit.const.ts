/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Stream
 * Export: onExit
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Stream.ts
 * Generated: 2026-02-19T04:14:21.441Z
 *
 * Overview:
 * Runs the provided finalizer when the stream exits, passing the exit value.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect, Exit, Stream } from "effect"
 *
 * const stream = Stream.make(1, 2, 3).pipe(
 *   Stream.onExit((exit) =>
 *     Exit.isSuccess(exit)
 *       ? Console.log("Stream completed successfully")
 *       : Console.log("Stream failed")
 *   )
 * )
 *
 * Effect.runPromise(Effect.gen(function*() {
 *   yield* Stream.runCollect(stream)
 * }))
 * // Output:
 * // Stream completed successfully
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
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as StreamModule from "effect/Stream";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "onExit";
const exportKind = "const";
const moduleImportPath = "effect/Stream";
const sourceSummary = "Runs the provided finalizer when the stream exits, passing the exit value.";
const sourceExample =
  'import { Console, Effect, Exit, Stream } from "effect"\n\nconst stream = Stream.make(1, 2, 3).pipe(\n  Stream.onExit((exit) =>\n    Exit.isSuccess(exit)\n      ? Console.log("Stream completed successfully")\n      : Console.log("Stream failed")\n  )\n)\n\nEffect.runPromise(Effect.gen(function*() {\n  yield* Stream.runCollect(stream)\n}))\n// Output:\n// Stream completed successfully';
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
