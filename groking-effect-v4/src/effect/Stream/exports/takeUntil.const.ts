/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Stream
 * Export: takeUntil
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Stream.ts
 * Generated: 2026-02-19T04:14:21.444Z
 *
 * Overview:
 * Takes elements until the predicate matches.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect, Stream } from "effect"
 *
 * const stream = Stream.range(1, 5)
 *
 * const program = Effect.gen(function*() {
 *   const inclusive = yield* stream.pipe(
 *     Stream.takeUntil((n) => n % 3 === 0),
 *     Stream.runCollect
 *   )
 *   yield* Console.log(inclusive)
 *   // Output: [ 1, 2, 3 ]
 *
 *   const exclusive = yield* stream.pipe(
 *     Stream.takeUntil((n) => n % 3 === 0, { excludeLast: true }),
 *     Stream.runCollect
 *   )
 *   yield* Console.log(exclusive)
 *   // Output: [ 1, 2 ]
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
const exportName = "takeUntil";
const exportKind = "const";
const moduleImportPath = "effect/Stream";
const sourceSummary = "Takes elements until the predicate matches.";
const sourceExample =
  'import { Console, Effect, Stream } from "effect"\n\nconst stream = Stream.range(1, 5)\n\nconst program = Effect.gen(function*() {\n  const inclusive = yield* stream.pipe(\n    Stream.takeUntil((n) => n % 3 === 0),\n    Stream.runCollect\n  )\n  yield* Console.log(inclusive)\n  // Output: [ 1, 2, 3 ]\n\n  const exclusive = yield* stream.pipe(\n    Stream.takeUntil((n) => n % 3 === 0, { excludeLast: true }),\n    Stream.runCollect\n  )\n  yield* Console.log(exclusive)\n  // Output: [ 1, 2 ]\n})';
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
