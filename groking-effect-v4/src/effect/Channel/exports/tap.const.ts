/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Channel
 * Export: tap
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Channel.ts
 * Generated: 2026-02-19T04:14:10.641Z
 *
 * Overview:
 * Applies a side effect function to each output element of the channel, returning a new channel that emits the same elements.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Channel, Console, Data } from "effect"
 * 
 * class LogError extends Data.TaggedError("LogError")<{
 *   readonly message: string
 * }> {}
 * 
 * // Create a channel that outputs numbers
 * const numberChannel = Channel.fromIterable([1, 2, 3])
 * 
 * // Tap into each output element to perform side effects
 * const tappedChannel = Channel.tap(
 *   numberChannel,
 *   (n) => Console.log(`Processing number: ${n}`)
 * )
 * 
 * // The channel still outputs the same elements but logs each one
 * // Outputs: 1, 2, 3 (while logging each)
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
const exportName = "tap";
const exportKind = "const";
const moduleImportPath = "effect/Channel";
const sourceSummary = "Applies a side effect function to each output element of the channel, returning a new channel that emits the same elements.";
const sourceExample = "import { Channel, Console, Data } from \"effect\"\n\nclass LogError extends Data.TaggedError(\"LogError\")<{\n  readonly message: string\n}> {}\n\n// Create a channel that outputs numbers\nconst numberChannel = Channel.fromIterable([1, 2, 3])\n\n// Tap into each output element to perform side effects\nconst tappedChannel = Channel.tap(\n  numberChannel,\n  (n) => Console.log(`Processing number: ${n}`)\n)\n\n// The channel still outputs the same elements but logs each one\n// Outputs: 1, 2, 3 (while logging each)";
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
