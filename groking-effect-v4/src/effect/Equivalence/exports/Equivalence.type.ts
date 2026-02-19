/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Equivalence
 * Export: Equivalence
 * Kind: type
 * Source: .repos/effect-smol/packages/effect/src/Equivalence.ts
 * Generated: 2026-02-19T04:50:36.032Z
 *
 * Overview:
 * Represents an equivalence relation over type `A`.
 *
 * Source JSDoc Example:
 * ```ts
 * import type { Equivalence } from "effect"
 *
 * const numberEq: Equivalence.Equivalence<number> = (a, b) => a === b
 *
 * console.log(numberEq(1, 1)) // true
 * console.log(numberEq(1, 2)) // false
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
const exportName = "Equivalence";
const exportKind = "type";
const moduleImportPath = "effect/Equivalence";
const sourceSummary = "Represents an equivalence relation over type `A`.";
const sourceExample =
  'import type { Equivalence } from "effect"\n\nconst numberEq: Equivalence.Equivalence<number> = (a, b) => a === b\n\nconsole.log(numberEq(1, 1)) // true\nconsole.log(numberEq(1, 2)) // false';
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
