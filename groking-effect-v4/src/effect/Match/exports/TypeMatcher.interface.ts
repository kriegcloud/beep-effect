/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Match
 * Export: TypeMatcher
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/Match.ts
 * Generated: 2026-02-19T04:50:37.671Z
 *
 * Overview:
 * Represents a pattern matcher that operates on types rather than specific values.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Match } from "effect"
 *
 * // Create a TypeMatcher for string | number
 * const matcher = Match.type<string | number>().pipe(
 *   Match.when(Match.string, (s) => `String: ${s}`),
 *   Match.when(Match.number, (n) => `Number: ${n}`),
 *   Match.exhaustive
 * )
 *
 * console.log(matcher("hello")) // "String: hello"
 * console.log(matcher(42)) // "Number: 42"
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
import * as MatchModule from "effect/Match";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "TypeMatcher";
const exportKind = "interface";
const moduleImportPath = "effect/Match";
const sourceSummary = "Represents a pattern matcher that operates on types rather than specific values.";
const sourceExample =
  'import { Match } from "effect"\n\n// Create a TypeMatcher for string | number\nconst matcher = Match.type<string | number>().pipe(\n  Match.when(Match.string, (s) => `String: ${s}`),\n  Match.when(Match.number, (n) => `Number: ${n}`),\n  Match.exhaustive\n)\n\nconsole.log(matcher("hello")) // "String: hello"\nconsole.log(matcher(42)) // "Number: 42"';
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
