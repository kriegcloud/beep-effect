/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Stream
 * Export: tapError
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Stream.ts
 * Generated: 2026-02-19T04:14:21.444Z
 *
 * Overview:
 * Effectfully peeks at errors without changing the stream unless the tap fails.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect, Stream } from "effect"
 *
 * const stream = Stream.make(1, 2).pipe(
 *   Stream.concat(Stream.fail("boom")),
 *   Stream.tapError((error) => Console.log(`tapError: ${error}`)),
 *   Stream.catch(() => Stream.make(999))
 * )
 *
 * const program = Effect.gen(function*() {
 *   const values = yield* Stream.runCollect(stream)
 *   yield* Console.log(values)
 * })
 *
 * Effect.runPromise(program)
 * // Output:
 * // tapError: boom
 * // [ 1, 2, 999 ]
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
const exportName = "tapError";
const exportKind = "const";
const moduleImportPath = "effect/Stream";
const sourceSummary = "Effectfully peeks at errors without changing the stream unless the tap fails.";
const sourceExample =
  'import { Console, Effect, Stream } from "effect"\n\nconst stream = Stream.make(1, 2).pipe(\n  Stream.concat(Stream.fail("boom")),\n  Stream.tapError((error) => Console.log(`tapError: ${error}`)),\n  Stream.catch(() => Stream.make(999))\n)\n\nconst program = Effect.gen(function*() {\n  const values = yield* Stream.runCollect(stream)\n  yield* Console.log(values)\n})\n\nEffect.runPromise(program)\n// Output:\n// tapError: boom\n// [ 1, 2, 999 ]';
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
