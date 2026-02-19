/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Channel
 * Export: HaltStrategy
 * Kind: type
 * Source: .repos/effect-smol/packages/effect/src/Channel.ts
 * Generated: 2026-02-19T04:14:10.638Z
 *
 * Overview:
 * Represents strategies for halting merged channels when one completes or fails.
 *
 * Source JSDoc Example:
 * ```ts
 * import type { Channel } from "effect"
 * 
 * // Different halt strategies for channel merging
 * const leftFirst: Channel.HaltStrategy = "left" // Stop when left channel halts
 * const rightFirst: Channel.HaltStrategy = "right" // Stop when right channel halts
 * const both: Channel.HaltStrategy = "both" // Stop when both channels halt
 * const either: Channel.HaltStrategy = "either" // Stop when either channel halts
 * ```
 *
 * Focus:
 * - Type-only exports (`type`, `interface`) are erased at runtime.
 * - Runtime examples still provide module-level context for learning.
 */
import * as Effect from "effect/Effect";
import * as Console from "effect/Console";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as ChannelModule from "effect/Channel";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  inspectTypeLikeExport
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "HaltStrategy";
const exportKind = "type";
const moduleImportPath = "effect/Channel";
const sourceSummary = "Represents strategies for halting merged channels when one completes or fails.";
const sourceExample = "import type { Channel } from \"effect\"\n\n// Different halt strategies for channel merging\nconst leftFirst: Channel.HaltStrategy = \"left\" // Stop when left channel halts\nconst rightFirst: Channel.HaltStrategy = \"right\" // Stop when right channel halts\nconst both: Channel.HaltStrategy = \"both\" // Stop when both channels halt\nconst either: Channel.HaltStrategy = \"either\" // Stop when either channel halts";
const moduleRecord = ChannelModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleTypeRuntimeCheck = Effect.gen(function* () {
  yield* Console.log("Check runtime visibility for this type/interface export.");
  yield* inspectTypeLikeExport({ moduleRecord, exportName });
});

const exampleModuleContextInspection = Effect.gen(function* () {
  yield* Console.log("Inspect runtime module context around this type-like export.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

/* ========================================================================== *
 * Program
 * ========================================================================== */
const program = createPlaygroundProgram({
  icon: "🧠",
  moduleImportPath,
  exportName,
  exportKind,
  summary: sourceSummary,
  sourceExample,
  bunContext: BunContext,
  examples: [
    {
      title: "Type Erasure Check",
      description: "Confirm whether this symbol appears at runtime.",
      run: exampleTypeRuntimeCheck
    },
    {
      title: "Module Context Inspection",
      description: "Inspect the runtime module value for additional context.",
      run: exampleModuleContextInspection
    }
  ]
});

BunRuntime.runMain(program);
