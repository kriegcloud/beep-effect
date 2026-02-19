/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Channel
 * Export: fromIteratorArray
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Channel.ts
 * Generated: 2026-02-19T04:50:34.225Z
 *
 * Overview:
 * Creates a `Channel` from an iterator that emits arrays of elements.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Channel } from "effect"
 *
 * // Create a channel from a simple iterator
 * const numberIterator = (): Iterator<number, string> => {
 *   let count = 0
 *   return {
 *     next: () => {
 *       if (count < 3) {
 *         return { value: count++, done: false }
 *       }
 *       return { value: "finished", done: true }
 *     }
 *   }
 * }
 *
 * const channel = Channel.fromIteratorArray(() => numberIterator(), 2)
 * // This will emit arrays: [0, 1], [2], then complete with "finished"
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
import * as ChannelModule from "effect/Channel";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "fromIteratorArray";
const exportKind = "const";
const moduleImportPath = "effect/Channel";
const sourceSummary = "Creates a `Channel` from an iterator that emits arrays of elements.";
const sourceExample =
  'import { Channel } from "effect"\n\n// Create a channel from a simple iterator\nconst numberIterator = (): Iterator<number, string> => {\n  let count = 0\n  return {\n    next: () => {\n      if (count < 3) {\n        return { value: count++, done: false }\n      }\n      return { value: "finished", done: true }\n    }\n  }\n}\n\nconst channel = Channel.fromIteratorArray(() => numberIterator(), 2)\n// This will emit arrays: [0, 1], [2], then complete with "finished"';
const moduleRecord = ChannelModule as Record<string, unknown>;

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
