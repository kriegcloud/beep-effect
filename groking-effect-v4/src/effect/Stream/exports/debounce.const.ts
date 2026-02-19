/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Stream
 * Export: debounce
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Stream.ts
 * Generated: 2026-02-19T04:14:21.437Z
 *
 * Overview:
 * Drops earlier elements within the debounce window and emits only the latest element after the pause.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Duration, Effect, Stream } from "effect"
 *
 * const stream = Stream.make(1, 2, 3).pipe(
 *   Stream.concat(Stream.fromEffect(Effect.sleep(Duration.millis(50)).pipe(Effect.as(4)))),
 *   Stream.concat(Stream.make(5)),
 *   Stream.debounce(Duration.millis(30))
 * )
 *
 * const program = Effect.gen(function*() {
 *   const values = yield* Stream.runCollect(stream)
 *   yield* Console.log(values)
 *   // Output: [ 3, 5 ]
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
const exportName = "debounce";
const exportKind = "const";
const moduleImportPath = "effect/Stream";
const sourceSummary =
  "Drops earlier elements within the debounce window and emits only the latest element after the pause.";
const sourceExample =
  'import { Console, Duration, Effect, Stream } from "effect"\n\nconst stream = Stream.make(1, 2, 3).pipe(\n  Stream.concat(Stream.fromEffect(Effect.sleep(Duration.millis(50)).pipe(Effect.as(4)))),\n  Stream.concat(Stream.make(5)),\n  Stream.debounce(Duration.millis(30))\n)\n\nconst program = Effect.gen(function*() {\n  const values = yield* Stream.runCollect(stream)\n  yield* Console.log(values)\n  // Output: [ 3, 5 ]\n})';
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
