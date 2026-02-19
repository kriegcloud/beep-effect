/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Match
 * Export: Not
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/Match.ts
 * Generated: 2026-02-19T04:14:14.901Z
 *
 * Overview:
 * Represents a negative pattern matching case.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Match } from "effect"
 *
 * // Not creates cases that exclude specific patterns
 * const matcher = Match.type<string>().pipe(
 *   // Match any string except "forbidden"
 *   Match.not("forbidden", (s) => `Allowed: ${s}`),
 *   Match.orElse(() => "This string is forbidden")
 * )
 *
 * console.log(matcher("hello")) // "Allowed: hello"
 * console.log(matcher("forbidden")) // "This string is forbidden"
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
const exportName = "Not";
const exportKind = "interface";
const moduleImportPath = "effect/Match";
const sourceSummary = "Represents a negative pattern matching case.";
const sourceExample =
  'import { Match } from "effect"\n\n// Not creates cases that exclude specific patterns\nconst matcher = Match.type<string>().pipe(\n  // Match any string except "forbidden"\n  Match.not("forbidden", (s) => `Allowed: ${s}`),\n  Match.orElse(() => "This string is forbidden")\n)\n\nconsole.log(matcher("hello")) // "Allowed: hello"\nconsole.log(matcher("forbidden")) // "This string is forbidden"';
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
