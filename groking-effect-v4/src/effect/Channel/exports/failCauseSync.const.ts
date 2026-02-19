/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Channel
 * Export: failCauseSync
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Channel.ts
 * Generated: 2026-02-19T04:50:34.224Z
 *
 * Overview:
 * Constructs a channel that fails immediately with the specified lazily evaluated `Cause`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Cause, Channel } from "effect"
 *
 * // Create a channel that fails with a lazily computed cause
 * const failedChannel = Channel.failCauseSync(() => {
 *   const errorType = Math.random() > 0.5 ? "A" : "B"
 *   return Cause.fail(`Runtime error ${errorType}`)
 * })
 *
 * // Create a channel with die cause computation
 * const dieCauseChannel = Channel.failCauseSync(() => {
 *   const timestamp = Date.now()
 *   return Cause.die(`Error at ${timestamp}`)
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
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as ChannelModule from "effect/Channel";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "failCauseSync";
const exportKind = "const";
const moduleImportPath = "effect/Channel";
const sourceSummary = "Constructs a channel that fails immediately with the specified lazily evaluated `Cause`.";
const sourceExample =
  'import { Cause, Channel } from "effect"\n\n// Create a channel that fails with a lazily computed cause\nconst failedChannel = Channel.failCauseSync(() => {\n  const errorType = Math.random() > 0.5 ? "A" : "B"\n  return Cause.fail(`Runtime error ${errorType}`)\n})\n\n// Create a channel with die cause computation\nconst dieCauseChannel = Channel.failCauseSync(() => {\n  const timestamp = Date.now()\n  return Cause.die(`Error at ${timestamp}`)\n})';
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
