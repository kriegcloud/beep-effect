/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Channel
 * Export: onExit
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Channel.ts
 * Generated: 2026-02-19T04:50:34.227Z
 *
 * Overview:
 * Returns a new channel with an attached finalizer. The finalizer is guaranteed to be executed so long as the channel begins execution (and regardless of whether or not it completes).
 *
 * Source JSDoc Example:
 * ```ts
 * import { Channel, Console, Data, Exit } from "effect"
 *
 * class ExitError extends Data.TaggedError("ExitError")<{
 *   readonly stage: string
 * }> {}
 *
 * // Create a channel
 * const dataChannel = Channel.fromIterable([1, 2, 3])
 *
 * // Attach exit handler
 * const channelWithExit = Channel.onExit(dataChannel, (exit) => {
 *   if (Exit.isSuccess(exit)) {
 *     return Console.log(`Channel completed successfully with: ${exit.value}`)
 *   } else {
 *     return Console.log(`Channel failed with: ${exit.cause}`)
 *   }
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
const exportName = "onExit";
const exportKind = "const";
const moduleImportPath = "effect/Channel";
const sourceSummary =
  "Returns a new channel with an attached finalizer. The finalizer is guaranteed to be executed so long as the channel begins execution (and regardless of whether or not it complet...";
const sourceExample =
  'import { Channel, Console, Data, Exit } from "effect"\n\nclass ExitError extends Data.TaggedError("ExitError")<{\n  readonly stage: string\n}> {}\n\n// Create a channel\nconst dataChannel = Channel.fromIterable([1, 2, 3])\n\n// Attach exit handler\nconst channelWithExit = Channel.onExit(dataChannel, (exit) => {\n  if (Exit.isSuccess(exit)) {\n    return Console.log(`Channel completed successfully with: ${exit.value}`)\n  } else {\n    return Console.log(`Channel failed with: ${exit.cause}`)\n  }\n})';
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
