/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Channel
 * Export: runCount
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Channel.ts
 * Generated: 2026-02-19T04:14:10.640Z
 *
 * Overview:
 * Runs a channel and counts the number of elements it outputs.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Channel, Data } from "effect"
 * 
 * class CountError extends Data.TaggedError("CountError")<{
 *   readonly reason: string
 * }> {}
 * 
 * // Create a channel with multiple elements
 * const numbersChannel = Channel.fromIterable([1, 2, 3, 4, 5])
 * 
 * // Count the elements
 * const countEffect = Channel.runCount(numbersChannel)
 * 
 * // Effect.runSync(countEffect) // Returns: 5
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
const exportName = "runCount";
const exportKind = "const";
const moduleImportPath = "effect/Channel";
const sourceSummary = "Runs a channel and counts the number of elements it outputs.";
const sourceExample = "import { Channel, Data } from \"effect\"\n\nclass CountError extends Data.TaggedError(\"CountError\")<{\n  readonly reason: string\n}> {}\n\n// Create a channel with multiple elements\nconst numbersChannel = Channel.fromIterable([1, 2, 3, 4, 5])\n\n// Count the elements\nconst countEffect = Channel.runCount(numbersChannel)\n\n// Effect.runSync(countEffect) // Returns: 5";
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
