/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Channel
 * Export: drain
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Channel.ts
 * Generated: 2026-02-19T04:14:10.636Z
 *
 * Overview:
 * Creates a new channel that consumes all output from the source channel but emits nothing, preserving only the completion value.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Channel } from "effect"
 * 
 * // Create a channel that outputs values
 * const sourceChannel = Channel.fromIterable([1, 2, 3, 4, 5])
 * 
 * // Drain all output, keeping only the completion
 * const drainedChannel = Channel.drain(sourceChannel)
 * 
 * // The channel completes but emits no values
 * // Useful for consuming side effects without collecting output
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
const exportName = "drain";
const exportKind = "const";
const moduleImportPath = "effect/Channel";
const sourceSummary = "Creates a new channel that consumes all output from the source channel but emits nothing, preserving only the completion value.";
const sourceExample = "import { Channel } from \"effect\"\n\n// Create a channel that outputs values\nconst sourceChannel = Channel.fromIterable([1, 2, 3, 4, 5])\n\n// Drain all output, keeping only the completion\nconst drainedChannel = Channel.drain(sourceChannel)\n\n// The channel completes but emits no values\n// Useful for consuming side effects without collecting output";
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
