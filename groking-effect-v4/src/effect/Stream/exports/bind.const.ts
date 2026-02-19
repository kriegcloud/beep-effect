/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Stream
 * Export: bind
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Stream.ts
 * Generated: 2026-02-19T04:50:42.444Z
 *
 * Overview:
 * Binds the result of a stream to a field in the do-notation record.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect, Stream } from "effect"
 *
 * const program = Stream.Do.pipe(
 *   Stream.bind("a", () => Stream.make(1, 2)),
 *   Stream.bind("b", ({ a }) => Stream.succeed(a + 1))
 * )
 *
 * const result = Stream.runCollect(program)
 *
 * Effect.runPromise(Effect.flatMap(result, Console.log))
 * // [{ a: 1, b: 2 }, { a: 2, b: 3 }]
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
const exportName = "bind";
const exportKind = "const";
const moduleImportPath = "effect/Stream";
const sourceSummary = "Binds the result of a stream to a field in the do-notation record.";
const sourceExample =
  'import { Console, Effect, Stream } from "effect"\n\nconst program = Stream.Do.pipe(\n  Stream.bind("a", () => Stream.make(1, 2)),\n  Stream.bind("b", ({ a }) => Stream.succeed(a + 1))\n)\n\nconst result = Stream.runCollect(program)\n\nEffect.runPromise(Effect.flatMap(result, Console.log))\n// [{ a: 1, b: 2 }, { a: 2, b: 3 }]';
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
