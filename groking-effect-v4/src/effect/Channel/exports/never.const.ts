/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Channel
 * Export: never
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Channel.ts
 * Generated: 2026-02-19T04:14:10.639Z
 *
 * Overview:
 * Represents an Channel that never completes
 *
 * Source JSDoc Example:
 * ```ts
 * import { Channel } from "effect"
 *
 * // Create a channel that never completes
 * const neverChannel = Channel.never
 *
 * // Use in conditional logic
 * const withFallback = Channel.concatWith(
 *   neverChannel,
 *   () => Channel.succeed("fallback")
 * )
 *
 * // Never channel is useful for testing or as a placeholder
 * const conditionalChannel = (shouldComplete: boolean) =>
 *   shouldComplete ? Channel.succeed("done") : Channel.never
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
const exportName = "never";
const exportKind = "const";
const moduleImportPath = "effect/Channel";
const sourceSummary = "Represents an Channel that never completes";
const sourceExample =
  'import { Channel } from "effect"\n\n// Create a channel that never completes\nconst neverChannel = Channel.never\n\n// Use in conditional logic\nconst withFallback = Channel.concatWith(\n  neverChannel,\n  () => Channel.succeed("fallback")\n)\n\n// Never channel is useful for testing or as a placeholder\nconst conditionalChannel = (shouldComplete: boolean) =>\n  shouldComplete ? Channel.succeed("done") : Channel.never';
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
