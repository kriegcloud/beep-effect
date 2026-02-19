/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Stream
 * Export: failCause
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Stream.ts
 * Generated: 2026-02-19T04:14:21.438Z
 *
 * Overview:
 * Creates a stream that fails with the specified `Cause`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Cause, Console, Effect, Stream } from "effect"
 *
 * const stream = Stream.failCause(Cause.fail("Database connection failed")).pipe(
 *   Stream.catchCause(() => Stream.succeed("recovered"))
 * )
 *
 * const program = Effect.gen(function*() {
 *   const values = yield* Stream.runCollect(stream)
 *   yield* Console.log(values)
 *   // Output: [ "recovered" ]
 * })
 *
 * Effect.runPromise(program)
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
const exportName = "failCause";
const exportKind = "const";
const moduleImportPath = "effect/Stream";
const sourceSummary = "Creates a stream that fails with the specified `Cause`.";
const sourceExample =
  'import { Cause, Console, Effect, Stream } from "effect"\n\nconst stream = Stream.failCause(Cause.fail("Database connection failed")).pipe(\n  Stream.catchCause(() => Stream.succeed("recovered"))\n)\n\nconst program = Effect.gen(function*() {\n  const values = yield* Stream.runCollect(stream)\n  yield* Console.log(values)\n  // Output: [ "recovered" ]\n})\n\nEffect.runPromise(program)';
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
