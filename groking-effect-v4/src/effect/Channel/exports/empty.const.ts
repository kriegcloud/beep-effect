/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Channel
 * Export: empty
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Channel.ts
 * Generated: 2026-02-19T04:14:10.636Z
 *
 * Overview:
 * Represents an Channel that emits no elements
 *
 * Source JSDoc Example:
 * ```ts
 * import { Channel } from "effect"
 *
 * // Create an empty channel
 * const emptyChannel = Channel.empty
 *
 * // Use empty channel in composition
 * const combined = Channel.concatWith(emptyChannel, () => Channel.succeed(42))
 * // Will immediately provide the second channel's output
 *
 * // Empty channel can be used as a no-op in conditional logic
 * const conditionalChannel = (shouldEmit: boolean) =>
 *   shouldEmit ? Channel.succeed("data") : Channel.empty
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
const exportName = "empty";
const exportKind = "const";
const moduleImportPath = "effect/Channel";
const sourceSummary = "Represents an Channel that emits no elements";
const sourceExample =
  'import { Channel } from "effect"\n\n// Create an empty channel\nconst emptyChannel = Channel.empty\n\n// Use empty channel in composition\nconst combined = Channel.concatWith(emptyChannel, () => Channel.succeed(42))\n// Will immediately provide the second channel\'s output\n\n// Empty channel can be used as a no-op in conditional logic\nconst conditionalChannel = (shouldEmit: boolean) =>\n  shouldEmit ? Channel.succeed("data") : Channel.empty';
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
