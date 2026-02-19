/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Stream
 * Export: sliding
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Stream.ts
 * Generated: 2026-02-19T04:50:42.472Z
 *
 * Overview:
 * Emits a sliding window of `n` elements.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect, Stream, pipe } from "effect"
 *
 * Effect.gen(function*() {
 *   const result = yield* pipe(
 *     Stream.make(1, 2, 3, 4, 5),
 *     Stream.sliding(2),
 *     Stream.runCollect
 *   )
 *   yield* Console.log(result)
 * })
 * // Output: [ [1, 2], [2, 3], [3, 4], [4, 5] ]
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
const exportName = "sliding";
const exportKind = "const";
const moduleImportPath = "effect/Stream";
const sourceSummary = "Emits a sliding window of `n` elements.";
const sourceExample =
  'import { Console, Effect, Stream, pipe } from "effect"\n\nEffect.gen(function*() {\n  const result = yield* pipe(\n    Stream.make(1, 2, 3, 4, 5),\n    Stream.sliding(2),\n    Stream.runCollect\n  )\n  yield* Console.log(result)\n})\n// Output: [ [1, 2], [2, 3], [3, 4], [4, 5] ]';
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
