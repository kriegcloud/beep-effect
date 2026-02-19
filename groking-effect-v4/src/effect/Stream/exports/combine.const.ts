/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Stream
 * Export: combine
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Stream.ts
 * Generated: 2026-02-19T04:14:21.437Z
 *
 * Overview:
 * Combines elements from this stream and the specified stream by repeatedly applying a stateful function that can pull from either side.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect, Stream } from "effect"
 *
 * const stream = Stream.combine(
 *   Stream.make("A", "B", "C"),
 *   Stream.make(1, 2, 3),
 *   () => true,
 *   (takeLeft, pullLeft, pullRight) =>
 *     takeLeft
 *       ? Effect.map(pullLeft, (value) => [`L:${value}`, false] as const)
 *       : Effect.map(pullRight, (value) => [`R:${value}`, true] as const)
 * )
 *
 * const program = Effect.gen(function*() {
 *   const output = yield* Stream.runCollect(stream)
 *   yield* Console.log(output)
 * })
 *
 * Effect.runPromise(program)
 * // Output: [ "L:A", "R:1", "L:B", "R:2", "L:C", "R:3" ]
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
const exportName = "combine";
const exportKind = "const";
const moduleImportPath = "effect/Stream";
const sourceSummary =
  "Combines elements from this stream and the specified stream by repeatedly applying a stateful function that can pull from either side.";
const sourceExample =
  'import { Console, Effect, Stream } from "effect"\n\nconst stream = Stream.combine(\n  Stream.make("A", "B", "C"),\n  Stream.make(1, 2, 3),\n  () => true,\n  (takeLeft, pullLeft, pullRight) =>\n    takeLeft\n      ? Effect.map(pullLeft, (value) => [`L:${value}`, false] as const)\n      : Effect.map(pullRight, (value) => [`R:${value}`, true] as const)\n)\n\nconst program = Effect.gen(function*() {\n  const output = yield* Stream.runCollect(stream)\n  yield* Console.log(output)\n})\n\nEffect.runPromise(program)\n// Output: [ "L:A", "R:1", "L:B", "R:2", "L:C", "R:3" ]';
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
