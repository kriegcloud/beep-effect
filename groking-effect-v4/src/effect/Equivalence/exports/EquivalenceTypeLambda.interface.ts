/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Equivalence
 * Export: EquivalenceTypeLambda
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/Equivalence.ts
 * Generated: 2026-02-19T04:50:36.032Z
 *
 * Overview:
 * Type lambda for `Equivalence`, used for higher-kinded type operations.
 *
 * Source JSDoc Example:
 * ```ts
 * import type { Equivalence } from "effect"
 * import type { Kind } from "effect/HKT"
 *
 * // Used internally for type-level computations
 * type NumberEquivalence = Kind<
 *   Equivalence.EquivalenceTypeLambda,
 *   never,
 *   never,
 *   never,
 *   number
 * >
 * // Equivalent to: Equivalence.Equivalence<number>
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
import * as EquivalenceModule from "effect/Equivalence";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "EquivalenceTypeLambda";
const exportKind = "interface";
const moduleImportPath = "effect/Equivalence";
const sourceSummary = "Type lambda for `Equivalence`, used for higher-kinded type operations.";
const sourceExample =
  'import type { Equivalence } from "effect"\nimport type { Kind } from "effect/HKT"\n\n// Used internally for type-level computations\ntype NumberEquivalence = Kind<\n  Equivalence.EquivalenceTypeLambda,\n  never,\n  never,\n  never,\n  number\n>\n// Equivalent to: Equivalence.Equivalence<number>';
const moduleRecord = EquivalenceModule as Record<string, unknown>;

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
