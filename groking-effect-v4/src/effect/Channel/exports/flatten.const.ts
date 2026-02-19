/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Channel
 * Export: flatten
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Channel.ts
 * Generated: 2026-02-19T04:14:10.637Z
 *
 * Overview:
 * Flatten a channel of channels.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Channel, Data } from "effect"
 * 
 * class FlattenError extends Data.TaggedError("FlattenError")<{
 *   readonly cause: string
 * }> {}
 * 
 * // Create a channel that outputs channels
 * const nestedChannels = Channel.fromIterable([
 *   Channel.fromIterable([1, 2]),
 *   Channel.fromIterable([3, 4]),
 *   Channel.fromIterable([5, 6])
 * ])
 * 
 * // Flatten the nested channels
 * const flattenedChannel = Channel.flatten(nestedChannels)
 * 
 * // Outputs: 1, 2, 3, 4, 5, 6
 * ```
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */
import * as Effect from "effect/Effect";
import * as Console from "effect/Console";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as ChannelModule from "effect/Channel";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "flatten";
const exportKind = "const";
const moduleImportPath = "effect/Channel";
const sourceSummary = "Flatten a channel of channels.";
const sourceExample = "import { Channel, Data } from \"effect\"\n\nclass FlattenError extends Data.TaggedError(\"FlattenError\")<{\n  readonly cause: string\n}> {}\n\n// Create a channel that outputs channels\nconst nestedChannels = Channel.fromIterable([\n  Channel.fromIterable([1, 2]),\n  Channel.fromIterable([3, 4]),\n  Channel.fromIterable([5, 6])\n])\n\n// Flatten the nested channels\nconst flattenedChannel = Channel.flatten(nestedChannels)\n\n// Outputs: 1, 2, 3, 4, 5, 6";
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
      run: exampleRuntimeInspection
    },
    {
      title: "Callable Value Probe",
      description: "Attempt a zero-arg invocation when the value is function-like.",
      run: exampleCallableProbe
    }
  ]
});

BunRuntime.runMain(program);
