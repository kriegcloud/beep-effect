/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Channel
 * Export: transformPull
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Channel.ts
 * Generated: 2026-02-19T04:14:10.642Z
 *
 * Overview:
 * Transforms a Channel by applying a function to its Pull implementation.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Channel, Effect } from "effect"
 * 
 * // Transform a channel by modifying its pull behavior
 * const originalChannel = Channel.fromIterable([1, 2, 3])
 * 
 * const transformedChannel = Channel.transformPull(
 *   originalChannel,
 *   (pull, scope) =>
 *     Effect.succeed(
 *       Effect.map(pull, (value) => value * 2)
 *     )
 * )
 * // Outputs: 2, 4, 6
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
const exportName = "transformPull";
const exportKind = "const";
const moduleImportPath = "effect/Channel";
const sourceSummary = "Transforms a Channel by applying a function to its Pull implementation.";
const sourceExample = "import { Channel, Effect } from \"effect\"\n\n// Transform a channel by modifying its pull behavior\nconst originalChannel = Channel.fromIterable([1, 2, 3])\n\nconst transformedChannel = Channel.transformPull(\n  originalChannel,\n  (pull, scope) =>\n    Effect.succeed(\n      Effect.map(pull, (value) => value * 2)\n    )\n)\n// Outputs: 2, 4, 6";
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
