/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Match
 * Export: When
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/Match.ts
 * Generated: 2026-02-19T04:14:14.902Z
 *
 * Overview:
 * Represents a positive pattern matching case.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Match } from "effect"
 * 
 * // When creates cases that match specific patterns
 * const stringMatcher = Match.type<string | number>().pipe(
 *   Match.when(Match.string, (s: string) => `Got string: ${s}`),
 *   Match.when(Match.number, (n: number) => `Got number: ${n}`),
 *   Match.exhaustive
 * )
 * 
 * console.log(stringMatcher("hello")) // "Got string: hello"
 * console.log(stringMatcher(42)) // "Got number: 42"
 * ```
 *
 * Focus:
 * - Type-only exports (`type`, `interface`) are erased at runtime.
 * - Runtime examples still provide module-level context for learning.
 */
import * as Effect from "effect/Effect";
import * as Console from "effect/Console";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as MatchModule from "effect/Match";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  inspectTypeLikeExport
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "When";
const exportKind = "interface";
const moduleImportPath = "effect/Match";
const sourceSummary = "Represents a positive pattern matching case.";
const sourceExample = "import { Match } from \"effect\"\n\n// When creates cases that match specific patterns\nconst stringMatcher = Match.type<string | number>().pipe(\n  Match.when(Match.string, (s: string) => `Got string: ${s}`),\n  Match.when(Match.number, (n: number) => `Got number: ${n}`),\n  Match.exhaustive\n)\n\nconsole.log(stringMatcher(\"hello\")) // \"Got string: hello\"\nconsole.log(stringMatcher(42)) // \"Got number: 42\"";
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
      run: exampleTypeRuntimeCheck
    },
    {
      title: "Module Context Inspection",
      description: "Inspect the runtime module value for additional context.",
      run: exampleModuleContextInspection
    }
  ]
});

BunRuntime.runMain(program);
