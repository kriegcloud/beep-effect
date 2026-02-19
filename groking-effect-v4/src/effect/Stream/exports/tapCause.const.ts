/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Stream
 * Export: tapCause
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Stream.ts
 * Generated: 2026-02-19T04:50:42.475Z
 *
 * Overview:
 * Runs an effect when the stream fails without changing its values or error, unless the tap effect itself fails.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Cause, Console, Effect, Stream } from "effect"
 *
 * const stream = Stream.make(1, 2).pipe(
 *   Stream.concat(Stream.fail("boom")),
 *   Stream.tapCause((cause) => Console.log(Cause.isReason(cause))),
 *   Stream.catch(() => Stream.succeed(0))
 * )
 *
 * const program = Effect.gen(function* () {
 *   const result = yield* Stream.runCollect(stream)
 *   yield* Console.log(result)
 * })
 *
 * Effect.runPromise(program)
 * // Output: true
 * // Output: [ 1, 2, 0 ]
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
const exportName = "tapCause";
const exportKind = "const";
const moduleImportPath = "effect/Stream";
const sourceSummary =
  "Runs an effect when the stream fails without changing its values or error, unless the tap effect itself fails.";
const sourceExample =
  'import { Cause, Console, Effect, Stream } from "effect"\n\nconst stream = Stream.make(1, 2).pipe(\n  Stream.concat(Stream.fail("boom")),\n  Stream.tapCause((cause) => Console.log(Cause.isReason(cause))),\n  Stream.catch(() => Stream.succeed(0))\n)\n\nconst program = Effect.gen(function* () {\n  const result = yield* Stream.runCollect(stream)\n  yield* Console.log(result)\n})\n\nEffect.runPromise(program)\n// Output: true\n// Output: [ 1, 2, 0 ]';
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
