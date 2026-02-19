/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Stream
 * Export: StreamUnify
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/Stream.ts
 * Generated: 2026-02-19T04:50:42.474Z
 *
 * Overview:
 * Type-level unification hook for Stream within the Effect type system.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, Stream } from "effect"
 *
 * // StreamUnify helps unify Stream and Effect types
 * declare const stream: Stream.Stream<number>
 * declare const effect: Effect.Effect<string>
 *
 * // The unification system handles mixed operations
 * const combined = Effect.zip(stream.pipe(Stream.runCollect), effect)
 * ```
 *
 * Focus:
 * - Type-only exports (`type`, `interface`) are erased at runtime.
 * - Runtime examples still provide module-level context for learning.
 */

import {
  createPlaygroundProgram,
  inspectNamedExport,
  inspectTypeLikeExport,
} from "@beep/groking-effect-v4/runtime/Playground";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as StreamModule from "effect/Stream";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "StreamUnify";
const exportKind = "interface";
const moduleImportPath = "effect/Stream";
const sourceSummary = "Type-level unification hook for Stream within the Effect type system.";
const sourceExample =
  'import { Effect, Stream } from "effect"\n\n// StreamUnify helps unify Stream and Effect types\ndeclare const stream: Stream.Stream<number>\ndeclare const effect: Effect.Effect<string>\n\n// The unification system handles mixed operations\nconst combined = Effect.zip(stream.pipe(Stream.runCollect), effect)';
const moduleRecord = StreamModule as Record<string, unknown>;

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
  examples: [
    {
      title: "Type Erasure Check",
      description: "Confirm whether this symbol appears at runtime.",
      run: exampleTypeRuntimeCheck,
    },
    {
      title: "Module Context Inspection",
      description: "Inspect the runtime module value for additional context.",
      run: exampleModuleContextInspection,
    },
  ],
});

BunRuntime.runMain(program);
