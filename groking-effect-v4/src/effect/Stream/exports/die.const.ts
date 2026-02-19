/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Stream
 * Export: die
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Stream.ts
 * Generated: 2026-02-19T04:50:42.449Z
 *
 * Overview:
 * The stream that dies with the specified defect.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Cause, Console, Effect, Exit, Stream } from "effect"
 *
 * const defect = new Error("Boom")
 * const stream = Stream.die(defect)
 *
 * const program = Effect.gen(function*() {
 *   const exit = yield* Effect.exit(Stream.runCollect(stream))
 *   const message = Exit.match(exit, {
 *     onSuccess: () => "Exit.Success",
 *     onFailure: (cause) => {
 *       const reason = cause.reasons[0]
 *       const defect = Cause.isDieReason(reason) ? String(reason.defect) : "Unexpected reason"
 *       return `Exit.Failure(${defect})`
 *     }
 *   })
 *   yield* Console.log(message)
 * })
 *
 * Effect.runPromise(program)
 * // Output: Exit.Failure(Error: Boom)
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
const exportName = "die";
const exportKind = "const";
const moduleImportPath = "effect/Stream";
const sourceSummary = "The stream that dies with the specified defect.";
const sourceExample =
  'import { Cause, Console, Effect, Exit, Stream } from "effect"\n\nconst defect = new Error("Boom")\nconst stream = Stream.die(defect)\n\nconst program = Effect.gen(function*() {\n  const exit = yield* Effect.exit(Stream.runCollect(stream))\n  const message = Exit.match(exit, {\n    onSuccess: () => "Exit.Success",\n    onFailure: (cause) => {\n      const reason = cause.reasons[0]\n      const defect = Cause.isDieReason(reason) ? String(reason.defect) : "Unexpected reason"\n      return `Exit.Failure(${defect})`\n    }\n  })\n  yield* Console.log(message)\n})\n\nEffect.runPromise(program)\n// Output: Exit.Failure(Error: Boom)';
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
