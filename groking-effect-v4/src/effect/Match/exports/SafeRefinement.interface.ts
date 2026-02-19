/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Match
 * Export: SafeRefinement
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/Match.ts
 * Generated: 2026-02-19T04:14:14.901Z
 *
 * Overview:
 * A safe refinement that narrows types without runtime errors.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Match } from "effect"
 *
 * // Built-in safe refinements
 * const processValue = Match.type<unknown>().pipe(
 *   Match.when(Match.string, (s) => s.toUpperCase()),
 *   Match.when(Match.number, (n) => n * 2),
 *   Match.when(Match.defined, (value) => `Defined: ${value}`),
 *   Match.orElse(() => "Undefined or null")
 * )
 *
 * console.log(processValue("hello")) // "HELLO"
 * console.log(processValue(21)) // 42
 * console.log(processValue(true)) // "Defined: true"
 * console.log(processValue(null)) // "Undefined or null"
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
import * as MatchModule from "effect/Match";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "SafeRefinement";
const exportKind = "interface";
const moduleImportPath = "effect/Match";
const sourceSummary = "A safe refinement that narrows types without runtime errors.";
const sourceExample =
  'import { Match } from "effect"\n\n// Built-in safe refinements\nconst processValue = Match.type<unknown>().pipe(\n  Match.when(Match.string, (s) => s.toUpperCase()),\n  Match.when(Match.number, (n) => n * 2),\n  Match.when(Match.defined, (value) => `Defined: ${value}`),\n  Match.orElse(() => "Undefined or null")\n)\n\nconsole.log(processValue("hello")) // "HELLO"\nconsole.log(processValue(21)) // 42\nconsole.log(processValue(true)) // "Defined: true"\nconsole.log(processValue(null)) // "Undefined or null"';
const moduleRecord = MatchModule as Record<string, unknown>;

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
