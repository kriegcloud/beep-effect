/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Stream
 * Export: splitLines
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Stream.ts
 * Generated: 2026-02-19T04:50:42.472Z
 *
 * Overview:
 * Splits a stream of strings into lines, handling `\n`, `\r`, and `\r\n` delimiters across chunks.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect, Stream } from "effect"
 *
 * Effect.runPromise(Effect.gen(function* () {
 *   const lines = yield* Stream.runCollect(
 *     Stream.make("a\nb\r\n", "c\n").pipe(Stream.splitLines)
 *   )
 *   yield* Console.log(lines)
 * }))
 * // ["a", "b", "c"]
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
const exportName = "splitLines";
const exportKind = "const";
const moduleImportPath = "effect/Stream";
const sourceSummary =
  "Splits a stream of strings into lines, handling `\\n`, `\\r`, and `\\r\\n` delimiters across chunks.";
const sourceExample =
  'import { Console, Effect, Stream } from "effect"\n\nEffect.runPromise(Effect.gen(function* () {\n  const lines = yield* Stream.runCollect(\n    Stream.make("a\\nb\\r\\n", "c\\n").pipe(Stream.splitLines)\n  )\n  yield* Console.log(lines)\n}))\n// ["a", "b", "c"]';
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
