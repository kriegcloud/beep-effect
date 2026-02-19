/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Stream
 * Export: mapAccum
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Stream.ts
 * Generated: 2026-02-19T04:14:21.440Z
 *
 * Overview:
 * Statefully maps elements, emitting zero or more outputs per input.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect, Stream } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const totals = yield* Stream.make(0, 1, 2, 3, 4, 5, 6).pipe(
 *     Stream.mapAccum(() => 0, (total, n) => {
 *       const next = total + n
 *       return [next, [next]] as const
 *     }),
 *     Stream.runCollect
 *   )
 *
 *   yield* Console.log(totals)
 * })
 *
 * Effect.runPromise(program)
 * // Output: [ 0, 1, 3, 6, 10, 15, 21 ]
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
const exportName = "mapAccum";
const exportKind = "const";
const moduleImportPath = "effect/Stream";
const sourceSummary = "Statefully maps elements, emitting zero or more outputs per input.";
const sourceExample =
  'import { Console, Effect, Stream } from "effect"\n\nconst program = Effect.gen(function*() {\n  const totals = yield* Stream.make(0, 1, 2, 3, 4, 5, 6).pipe(\n    Stream.mapAccum(() => 0, (total, n) => {\n      const next = total + n\n      return [next, [next]] as const\n    }),\n    Stream.runCollect\n  )\n\n  yield* Console.log(totals)\n})\n\nEffect.runPromise(program)\n// Output: [ 0, 1, 3, 6, 10, 15, 21 ]';
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
