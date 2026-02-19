/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/HKT
 * Export: Kind
 * Kind: type
 * Source: .repos/effect-smol/packages/effect/src/HKT.ts
 * Generated: 2026-02-19T04:50:37.086Z
 *
 * Overview:
 * Applies type parameters to a TypeLambda to get the concrete type.
 *
 * Source JSDoc Example:
 * ```ts
 * import type { Effect, HKT, Option } from "effect"
 *
 * // Define TypeLambdas
 * interface OptionTypeLambda extends HKT.TypeLambda {
 *   readonly type: Option.Option<this["Target"]>
 * }
 *
 * interface EffectTypeLambda extends HKT.TypeLambda {
 *   readonly type: Effect.Effect<this["Target"], this["Out2"], this["Out1"]>
 * }
 *
 * // Apply type parameters to get concrete types
 * type OptionString = HKT.Kind<OptionTypeLambda, never, never, never, string>
 * // Result: Option.Option<string>
 *
 * type EffectStringNumberBoolean = HKT.Kind<
 *   EffectTypeLambda,
 *   never,
 *   number,
 *   boolean,
 *   string
 * >
 * // Result: Effect.Effect<string, number, boolean>
 *
 * // TypeLambdas enable generic programming over type constructors
 * type StringType<F extends HKT.TypeLambda> = HKT.Kind<
 *   F,
 *   never,
 *   never,
 *   never,
 *   string
 * >
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
const exportName = "Kind";
const exportKind = "type";
const moduleImportPath = "effect/HKT";
const sourceSummary = "Applies type parameters to a TypeLambda to get the concrete type.";
const sourceExample =
  'import type { Effect, HKT, Option } from "effect"\n\n// Define TypeLambdas\ninterface OptionTypeLambda extends HKT.TypeLambda {\n  readonly type: Option.Option<this["Target"]>\n}\n\ninterface EffectTypeLambda extends HKT.TypeLambda {\n  readonly type: Effect.Effect<this["Target"], this["Out2"], this["Out1"]>\n}\n\n// Apply type parameters to get concrete types\ntype OptionString = HKT.Kind<OptionTypeLambda, never, never, never, string>\n// Result: Option.Option<string>\n\ntype EffectStringNumberBoolean = HKT.Kind<\n  EffectTypeLambda,\n  never,\n  number,\n  boolean,\n  string\n>\n// Result: Effect.Effect<string, number, boolean>\n\n// TypeLambdas enable generic programming over type constructors\ntype StringType<F extends HKT.TypeLambda> = HKT.Kind<\n  F,\n  never,\n  never,\n  never,\n  string\n>';
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
