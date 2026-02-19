/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Ordering
 * Export: Ordering
 * Kind: type
 * Source: .repos/effect-smol/packages/effect/src/Ordering.ts
 * Generated: 2026-02-19T04:14:15.476Z
 *
 * Overview:
 * Represents the result of comparing two values.
 *
 * Source JSDoc Example:
 * ```ts
 * import type { Ordering } from "effect"
 *
 * // Custom comparison function
 * const compareNumbers = (a: number, b: number): Ordering.Ordering => {
 *   if (a < b) return -1
 *   if (a > b) return 1
 *   return 0
 * }
 *
 * console.log(compareNumbers(5, 10)) // -1 (5 < 10)
 * console.log(compareNumbers(10, 5)) // 1 (10 > 5)
 * console.log(compareNumbers(5, 5)) // 0 (5 == 5)
 *
 * // Using with string comparison
 * const compareStrings = (a: string, b: string): Ordering.Ordering => {
 *   return a.localeCompare(b) as Ordering.Ordering
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
import * as OrderingModule from "effect/Ordering";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "Ordering";
const exportKind = "type";
const moduleImportPath = "effect/Ordering";
const sourceSummary = "Represents the result of comparing two values.";
const sourceExample =
  'import type { Ordering } from "effect"\n\n// Custom comparison function\nconst compareNumbers = (a: number, b: number): Ordering.Ordering => {\n  if (a < b) return -1\n  if (a > b) return 1\n  return 0\n}\n\nconsole.log(compareNumbers(5, 10)) // -1 (5 < 10)\nconsole.log(compareNumbers(10, 5)) // 1 (10 > 5)\nconsole.log(compareNumbers(5, 5)) // 0 (5 == 5)\n\n// Using with string comparison\nconst compareStrings = (a: string, b: string): Ordering.Ordering => {\n  return a.localeCompare(b) as Ordering.Ordering\n}';
const moduleRecord = OrderingModule as Record<string, unknown>;

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
