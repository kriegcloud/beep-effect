/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Match
 * Export: Matcher
 * Kind: type
 * Source: .repos/effect-smol/packages/effect/src/Match.ts
 * Generated: 2026-02-19T04:50:37.669Z
 *
 * Overview:
 * Pattern matching follows a structured process:
 *
 * Source JSDoc Example:
 * ```ts
 * import { Match } from "effect"
 *
 * // Simulated dynamic input that can be a string or a number
 * const input: string | number = "some input"
 *
 * //      ┌─── string
 * //      ▼
 * const result = Match.value(input).pipe(
 *   // Match if the value is a number
 *   Match.when(Match.number, (n) => `number: ${n}`),
 *   // Match if the value is a string
 *   Match.when(Match.string, (s) => `string: ${s}`),
 *   // Ensure all possible cases are covered
 *   Match.exhaustive
 * )
 *
 * console.log(result)
 * // Output: "string: some input"
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
const exportName = "Matcher";
const exportKind = "type";
const moduleImportPath = "effect/Match";
const sourceSummary = "Pattern matching follows a structured process:";
const sourceExample =
  'import { Match } from "effect"\n\n// Simulated dynamic input that can be a string or a number\nconst input: string | number = "some input"\n\n//      ┌─── string\n//      ▼\nconst result = Match.value(input).pipe(\n  // Match if the value is a number\n  Match.when(Match.number, (n) => `number: ${n}`),\n  // Match if the value is a string\n  Match.when(Match.string, (s) => `string: ${s}`),\n  // Ensure all possible cases are covered\n  Match.exhaustive\n)\n\nconsole.log(result)\n// Output: "string: some input"';
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
