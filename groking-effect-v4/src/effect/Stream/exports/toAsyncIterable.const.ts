/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Stream
 * Export: toAsyncIterable
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Stream.ts
 * Generated: 2026-02-19T04:14:21.445Z
 *
 * Overview:
 * Converts a stream to an `AsyncIterable` for `for await...of` consumption.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, Stream } from "effect"
 *
 * const stream = Stream.make(1, 2, 3)
 *
 * const program = Effect.gen(function* () {
 *   const iterable = Stream.toAsyncIterable(stream)
 *   const results = yield* Effect.promise(async () => {
 *     const values: Array<number> = []
 *     for await (const value of iterable) {
 *       values.push(value)
 *     }
 *     return values
 *   })
 *   return results
 * })
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
const exportName = "toAsyncIterable";
const exportKind = "const";
const moduleImportPath = "effect/Stream";
const sourceSummary = "Converts a stream to an `AsyncIterable` for `for await...of` consumption.";
const sourceExample =
  'import { Effect, Stream } from "effect"\n\nconst stream = Stream.make(1, 2, 3)\n\nconst program = Effect.gen(function* () {\n  const iterable = Stream.toAsyncIterable(stream)\n  const results = yield* Effect.promise(async () => {\n    const values: Array<number> = []\n    for await (const value of iterable) {\n      values.push(value)\n    }\n    return values\n  })\n  return results\n})';
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
