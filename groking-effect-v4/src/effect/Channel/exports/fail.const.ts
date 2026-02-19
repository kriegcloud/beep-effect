/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Channel
 * Export: fail
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Channel.ts
 * Generated: 2026-02-19T04:50:34.224Z
 *
 * Overview:
 * Constructs a channel that fails immediately with the specified error.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Channel } from "effect"
 *
 * // Create a channel that fails with a string error
 * const failedChannel = Channel.fail("Something went wrong")
 *
 * // Create a channel that fails with a custom error
 * class CustomError extends Error {
 *   constructor(message: string) {
 *     super(message)
 *     this.name = "CustomError"
 *   }
 * }
 * const customErrorChannel = Channel.fail(new CustomError("Custom error"))
 *
 * // Use in error handling by piping to another channel
 * const channelWithFallback = Channel.concatWith(
 *   failedChannel,
 *   () => Channel.succeed("fallback value")
 * )
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
const exportName = "fail";
const exportKind = "const";
const moduleImportPath = "effect/Channel";
const sourceSummary = "Constructs a channel that fails immediately with the specified error.";
const sourceExample =
  'import { Channel } from "effect"\n\n// Create a channel that fails with a string error\nconst failedChannel = Channel.fail("Something went wrong")\n\n// Create a channel that fails with a custom error\nclass CustomError extends Error {\n  constructor(message: string) {\n    super(message)\n    this.name = "CustomError"\n  }\n}\nconst customErrorChannel = Channel.fail(new CustomError("Custom error"))\n\n// Use in error handling by piping to another channel\nconst channelWithFallback = Channel.concatWith(\n  failedChannel,\n  () => Channel.succeed("fallback value")\n)';
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
