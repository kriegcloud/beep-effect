/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Sink
 * Export: SinkUnify
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/Sink.ts
 * Generated: 2026-02-19T04:14:20.454Z
 *
 * Overview:
 * Interface for Sink unification, used internally by the Effect type system to provide proper type inference when using Sink with other Effect types.
 *
 * Source JSDoc Example:
 * ```ts
 * import type { Effect } from "effect"
 * import type * as Sink from "effect/Sink"
 * import type * as Unify from "effect/Unify"
 *
 * // SinkUnify helps unify Sink and Effect types
 * declare const sink: Sink.Sink<number>
 * declare const effect: Effect.Effect<string>
 *
 * // The unification system handles mixed operations
 * type Combined = Sink.SinkUnify<{ [Unify.typeSymbol]?: any }>
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
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as SinkModule from "effect/Sink";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "SinkUnify";
const exportKind = "interface";
const moduleImportPath = "effect/Sink";
const sourceSummary =
  "Interface for Sink unification, used internally by the Effect type system to provide proper type inference when using Sink with other Effect types.";
const sourceExample =
  'import type { Effect } from "effect"\nimport type * as Sink from "effect/Sink"\nimport type * as Unify from "effect/Unify"\n\n// SinkUnify helps unify Sink and Effect types\ndeclare const sink: Sink.Sink<number>\ndeclare const effect: Effect.Effect<string>\n\n// The unification system handles mixed operations\ntype Combined = Sink.SinkUnify<{ [Unify.typeSymbol]?: any }>';
const moduleRecord = SinkModule as Record<string, unknown>;

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
