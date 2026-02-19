/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Channel
 * Export: toPull
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Channel.ts
 * Generated: 2026-02-19T04:14:10.642Z
 *
 * Overview:
 * Converts a channel to a Pull data structure for low-level consumption.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Channel, Data, Effect } from "effect"
 *
 * class PullError extends Data.TaggedError("PullError")<{
 *   readonly step: string
 * }> {}
 *
 * // Create a channel
 * const numbersChannel = Channel.fromIterable([1, 2, 3])
 *
 * // Convert to Pull within a scope
 * const pullEffect = Effect.scoped(
 *   Channel.toPull(numbersChannel)
 * )
 *
 * // Use the Pull to manually consume elements
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
import * as ChannelModule from "effect/Channel";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "toPull";
const exportKind = "const";
const moduleImportPath = "effect/Channel";
const sourceSummary = "Converts a channel to a Pull data structure for low-level consumption.";
const sourceExample =
  'import { Channel, Data, Effect } from "effect"\n\nclass PullError extends Data.TaggedError("PullError")<{\n  readonly step: string\n}> {}\n\n// Create a channel\nconst numbersChannel = Channel.fromIterable([1, 2, 3])\n\n// Convert to Pull within a scope\nconst pullEffect = Effect.scoped(\n  Channel.toPull(numbersChannel)\n)\n\n// Use the Pull to manually consume elements';
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
