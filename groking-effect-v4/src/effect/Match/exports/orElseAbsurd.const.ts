/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Match
 * Export: orElseAbsurd
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Match.ts
 * Generated: 2026-02-19T04:14:14.901Z
 *
 * Overview:
 * Throws an error if no pattern matches.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Match } from "effect"
 *
 * const strictMatcher = Match.type<"a" | "b">().pipe(
 *   Match.when("a", () => "Found A"),
 *   Match.when("b", () => "Found B"),
 *   // Will throw if input is neither "a" nor "b"
 *   Match.orElseAbsurd
 * )
 *
 * console.log(strictMatcher("a")) // "Found A"
 * console.log(strictMatcher("b")) // "Found B"
 *
 * // This would throw an error at runtime:
 * // strictMatcher("c" as any) // throws
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
const exportName = "orElseAbsurd";
const exportKind = "const";
const moduleImportPath = "effect/Match";
const sourceSummary = "Throws an error if no pattern matches.";
const sourceExample =
  'import { Match } from "effect"\n\nconst strictMatcher = Match.type<"a" | "b">().pipe(\n  Match.when("a", () => "Found A"),\n  Match.when("b", () => "Found B"),\n  // Will throw if input is neither "a" nor "b"\n  Match.orElseAbsurd\n)\n\nconsole.log(strictMatcher("a")) // "Found A"\nconsole.log(strictMatcher("b")) // "Found B"\n\n// This would throw an error at runtime:\n// strictMatcher("c" as any) // throws';
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
