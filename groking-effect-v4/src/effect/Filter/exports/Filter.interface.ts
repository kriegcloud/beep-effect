/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Filter
 * Export: Filter
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/Filter.ts
 * Generated: 2026-02-19T04:14:13.259Z
 *
 * Overview:
 * Represents a filter function that can transform inputs to outputs or filter them out.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Filter, Result } from "effect"
 *
 * // A filter that only passes positive numbers
 * const positiveFilter: Filter.Filter<number> = (n) => n > 0 ? Result.succeed(n) : Result.fail(n)
 *
 * console.log(positiveFilter(5)) // Result.succeed(5)
 * console.log(positiveFilter(-3)) // Result.fail(-3)
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
import * as FilterModule from "effect/Filter";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "Filter";
const exportKind = "interface";
const moduleImportPath = "effect/Filter";
const sourceSummary = "Represents a filter function that can transform inputs to outputs or filter them out.";
const sourceExample =
  'import { Filter, Result } from "effect"\n\n// A filter that only passes positive numbers\nconst positiveFilter: Filter.Filter<number> = (n) => n > 0 ? Result.succeed(n) : Result.fail(n)\n\nconsole.log(positiveFilter(5)) // Result.succeed(5)\nconsole.log(positiveFilter(-3)) // Result.fail(-3)';
const moduleRecord = FilterModule as Record<string, unknown>;

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
