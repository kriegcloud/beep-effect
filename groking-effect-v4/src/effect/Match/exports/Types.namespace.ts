/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Match
 * Export: Types
 * Kind: namespace
 * Source: .repos/effect-smol/packages/effect/src/Match.ts
 * Generated: 2026-02-19T04:14:14.902Z
 *
 * Overview:
 * A namespace containing utility types for Match operations.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Match } from "effect"
 *
 * // Most users won't need to use Types directly, but it powers the type system:
 * type MyPattern = Match.Types.PatternBase<{ name: string; age: number }>
 * type MyWhenMatch = Match.Types.WhenMatch<string | number, typeof Match.string>
 *
 * // These types are used internally to provide accurate type inference
 * const matcher = Match.type<string | number>().pipe(
 *   Match.when(Match.string, (s) => s.length), // s is correctly typed as string
 *   Match.when(Match.number, (n) => n * 2), // n is correctly typed as number
 *   Match.exhaustive
 * )
 * ```
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */

import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction,
} from "@beep/groking-effect-v4/runtime/Playground";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as MatchModule from "effect/Match";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "Types";
const exportKind = "namespace";
const moduleImportPath = "effect/Match";
const sourceSummary = "A namespace containing utility types for Match operations.";
const sourceExample =
  'import { Match } from "effect"\n\n// Most users won\'t need to use Types directly, but it powers the type system:\ntype MyPattern = Match.Types.PatternBase<{ name: string; age: number }>\ntype MyWhenMatch = Match.Types.WhenMatch<string | number, typeof Match.string>\n\n// These types are used internally to provide accurate type inference\nconst matcher = Match.type<string | number>().pipe(\n  Match.when(Match.string, (s) => s.length), // s is correctly typed as string\n  Match.when(Match.number, (n) => n * 2), // n is correctly typed as number\n  Match.exhaustive\n)';
const moduleRecord = MatchModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect the export as a runtime value and capture shape/preview.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleCallableProbe = Effect.gen(function* () {
  yield* Console.log("If the value is callable, run a zero-arg probe to observe behavior.");
  yield* probeNamedExportFunction({ moduleRecord, exportName });
});

/* ========================================================================== *
 * Program
 * ========================================================================== */
const program = createPlaygroundProgram({
  icon: "🔎",
  moduleImportPath,
  exportName,
  exportKind,
  summary: sourceSummary,
  sourceExample,
  bunContext: BunContext,
  examples: [
    {
      title: "Runtime Shape Inspection",
      description: "Inspect module export count, runtime type, and formatted preview.",
      run: exampleRuntimeInspection,
    },
    {
      title: "Callable Value Probe",
      description: "Attempt a zero-arg invocation when the value is function-like.",
      run: exampleCallableProbe,
    },
  ],
});

BunRuntime.runMain(program);
