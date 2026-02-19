/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Stream
 * Export: mergeAll
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Stream.ts
 * Generated: 2026-02-19T04:50:42.460Z
 *
 * Overview:
 * Merges a collection of streams, running up to the specified number concurrently.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect, Stream } from "effect"
 *
 * const streams = [
 *   Stream.fromEffect(Effect.delay(Effect.succeed("A"), "20 millis")),
 *   Stream.fromEffect(Effect.delay(Effect.succeed("B"), "10 millis"))
 * ]
 *
 * const program = Effect.gen(function*() {
 *   const values = yield* Stream.mergeAll(streams, { concurrency: 2 }).pipe(
 *     Stream.runCollect
 *   )
 *   yield* Console.log(values)
 * })
 *
 * Effect.runPromise(program)
 * // Output: [ "B", "A" ]
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
const exportName = "mergeAll";
const exportKind = "const";
const moduleImportPath = "effect/Stream";
const sourceSummary = "Merges a collection of streams, running up to the specified number concurrently.";
const sourceExample =
  'import { Console, Effect, Stream } from "effect"\n\nconst streams = [\n  Stream.fromEffect(Effect.delay(Effect.succeed("A"), "20 millis")),\n  Stream.fromEffect(Effect.delay(Effect.succeed("B"), "10 millis"))\n]\n\nconst program = Effect.gen(function*() {\n  const values = yield* Stream.mergeAll(streams, { concurrency: 2 }).pipe(\n    Stream.runCollect\n  )\n  yield* Console.log(values)\n})\n\nEffect.runPromise(program)\n// Output: [ "B", "A" ]';
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
