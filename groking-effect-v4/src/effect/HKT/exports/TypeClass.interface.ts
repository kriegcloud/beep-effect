/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/HKT
 * Export: TypeClass
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/HKT.ts
 * Generated: 2026-02-19T04:14:14.182Z
 *
 * Overview:
 * Base interface for type classes that work with Higher-Kinded Types.
 *
 * Source JSDoc Example:
 * ```ts
 * import type { HKT } from "effect"
 *
 * // Define a Functor type class
 * interface Functor<F extends HKT.TypeLambda> extends HKT.TypeClass<F> {
 *   map<A, B>(
 *     fa: HKT.Kind<F, never, never, never, A>,
 *     f: (a: A) => B
 *   ): HKT.Kind<F, never, never, never, B>
 * }
 *
 * // Define a Monad type class
 * interface Monad<F extends HKT.TypeLambda> extends Functor<F> {
 *   flatMap<A, B>(
 *     fa: HKT.Kind<F, never, never, never, A>,
 *     f: (a: A) => HKT.Kind<F, never, never, never, B>
 *   ): HKT.Kind<F, never, never, never, B>
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
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as HKTModule from "effect/HKT";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "TypeClass";
const exportKind = "interface";
const moduleImportPath = "effect/HKT";
const sourceSummary = "Base interface for type classes that work with Higher-Kinded Types.";
const sourceExample =
  'import type { HKT } from "effect"\n\n// Define a Functor type class\ninterface Functor<F extends HKT.TypeLambda> extends HKT.TypeClass<F> {\n  map<A, B>(\n    fa: HKT.Kind<F, never, never, never, A>,\n    f: (a: A) => B\n  ): HKT.Kind<F, never, never, never, B>\n}\n\n// Define a Monad type class\ninterface Monad<F extends HKT.TypeLambda> extends Functor<F> {\n  flatMap<A, B>(\n    fa: HKT.Kind<F, never, never, never, A>,\n    f: (a: A) => HKT.Kind<F, never, never, never, B>\n  ): HKT.Kind<F, never, never, never, B>\n}';
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
