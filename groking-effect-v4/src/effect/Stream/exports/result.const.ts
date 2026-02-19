/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Stream
 * Export: result
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Stream.ts
 * Generated: 2026-02-19T04:50:42.470Z
 *
 * Overview:
 * Lifts failures and successes into a `Result`, yielding a stream that cannot fail.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect, Result, Stream } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const results = yield* Stream.make(1, 2).pipe(
 *     Stream.concat(Stream.fail("boom")),
 *     Stream.result,
 *     Stream.map(Result.match({
 *       onFailure: (error) => `failure: ${error}`,
 *       onSuccess: (value) => `success: ${value}`
 *     })),
 *     Stream.runCollect
 *   )
 *   yield* Console.log(results)
 * })
 *
 * Effect.runPromise(program)
 * // Output: [ "success: 1", "success: 2", "failure: boom" ]
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
const exportName = "result";
const exportKind = "const";
const moduleImportPath = "effect/Stream";
const sourceSummary = "Lifts failures and successes into a `Result`, yielding a stream that cannot fail.";
const sourceExample =
  'import { Console, Effect, Result, Stream } from "effect"\n\nconst program = Effect.gen(function*() {\n  const results = yield* Stream.make(1, 2).pipe(\n    Stream.concat(Stream.fail("boom")),\n    Stream.result,\n    Stream.map(Result.match({\n      onFailure: (error) => `failure: ${error}`,\n      onSuccess: (value) => `success: ${value}`\n    })),\n    Stream.runCollect\n  )\n  yield* Console.log(results)\n})\n\nEffect.runPromise(program)\n// Output: [ "success: 1", "success: 2", "failure: boom" ]';
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
