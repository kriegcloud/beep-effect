/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Channel
 * Export: Channel
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/Channel.ts
 * Generated: 2026-02-19T04:14:10.636Z
 *
 * Overview:
 * A `Channel` is a nexus of I/O operations, which supports both reading and writing. A channel may read values of type `InElem` and write values of type `OutElem`. When the channel finishes, it yields a value of type `OutDone`. A channel may fail with a value of type `OutErr`.
 *
 * Source JSDoc Example:
 * ```ts
 * import type { Channel } from "effect"
 * 
 * // A channel that outputs numbers and requires no environment
 * type NumberChannel = Channel.Channel<number>
 * 
 * // A channel that outputs strings, can fail with Error, completes with boolean
 * type StringChannel = Channel.Channel<string, Error, boolean>
 * 
 * // A channel with all type parameters specified
 * type FullChannel = Channel.Channel<
 *   string, // OutElem - output elements
 *   Error, // OutErr - output errors
 *   number, // OutDone - completion value
 *   number, // InElem - input elements
 *   string, // InErr - input errors
 *   boolean, // InDone - input completion
 *   { db: string } // Env - required environment
 * >
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
const exportName = "Channel";
const exportKind = "interface";
const moduleImportPath = "effect/Channel";
const sourceSummary = "A `Channel` is a nexus of I/O operations, which supports both reading and writing. A channel may read values of type `InElem` and write values of type `OutElem`. When the channe...";
const sourceExample = "import type { Channel } from \"effect\"\n\n// A channel that outputs numbers and requires no environment\ntype NumberChannel = Channel.Channel<number>\n\n// A channel that outputs strings, can fail with Error, completes with boolean\ntype StringChannel = Channel.Channel<string, Error, boolean>\n\n// A channel with all type parameters specified\ntype FullChannel = Channel.Channel<\n  string, // OutElem - output elements\n  Error, // OutErr - output errors\n  number, // OutDone - completion value\n  number, // InElem - input elements\n  string, // InErr - input errors\n  boolean, // InDone - input completion\n  { db: string } // Env - required environment\n>";
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
