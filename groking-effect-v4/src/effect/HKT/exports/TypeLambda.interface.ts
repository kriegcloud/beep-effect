/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/HKT
 * Export: TypeLambda
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/HKT.ts
 * Generated: 2026-02-19T04:50:37.086Z
 *
 * Overview:
 * Base interface for defining Higher-Kinded Type parameters.
 *
 * Source JSDoc Example:
 * ```ts
 * import type { Effect, HKT } from "effect"
 *
 * // TypeLambda for Array<A>
 * interface ArrayTypeLambda extends HKT.TypeLambda {
 *   readonly type: Array<this["Target"]>
 * }
 *
 * // TypeLambda for Effect<A, E, R>
 * interface EffectTypeLambda extends HKT.TypeLambda {
 *   readonly type: Effect.Effect<this["Target"], this["Out2"], this["Out1"]>
 * }
 *
 * // TypeLambda for function (A) => B
 * interface FunctionTypeLambda extends HKT.TypeLambda {
 *   readonly type: (a: this["In"]) => this["Target"]
 * }
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
import * as HKTModule from "effect/HKT";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "TypeLambda";
const exportKind = "interface";
const moduleImportPath = "effect/HKT";
const sourceSummary = "Base interface for defining Higher-Kinded Type parameters.";
const sourceExample =
  'import type { Effect, HKT } from "effect"\n\n// TypeLambda for Array<A>\ninterface ArrayTypeLambda extends HKT.TypeLambda {\n  readonly type: Array<this["Target"]>\n}\n\n// TypeLambda for Effect<A, E, R>\ninterface EffectTypeLambda extends HKT.TypeLambda {\n  readonly type: Effect.Effect<this["Target"], this["Out2"], this["Out1"]>\n}\n\n// TypeLambda for function (A) => B\ninterface FunctionTypeLambda extends HKT.TypeLambda {\n  readonly type: (a: this["In"]) => this["Target"]\n}';
const moduleRecord = HKTModule as Record<string, unknown>;

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
