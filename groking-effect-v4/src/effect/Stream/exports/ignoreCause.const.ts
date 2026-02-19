/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Stream
 * Export: ignoreCause
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Stream.ts
 * Generated: 2026-02-19T04:14:21.440Z
 *
 * Overview:
 * Ignores the stream's failure cause, including defects, and ends the stream.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, Stream } from "effect"
 *
 * const stream = Stream.make(1, 2).pipe(
 *   Stream.concat(Stream.fail("boom")),
 *   Stream.ignoreCause({ log: "Error" })
 * )
 *
 * const program = Stream.runCollect(stream)
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
const exportName = "ignoreCause";
const exportKind = "const";
const moduleImportPath = "effect/Stream";
const sourceSummary = "Ignores the stream's failure cause, including defects, and ends the stream.";
const sourceExample =
  'import { Effect, Stream } from "effect"\n\nconst stream = Stream.make(1, 2).pipe(\n  Stream.concat(Stream.fail("boom")),\n  Stream.ignoreCause({ log: "Error" })\n)\n\nconst program = Stream.runCollect(stream)';
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
