/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Match
 * Export: nonEmptyString
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Match.ts
 * Generated: 2026-02-19T04:50:37.669Z
 *
 * Overview:
 * Matches non-empty strings.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Match } from "effect"
 *
 * const processInput = Match.type<string>()
 *   .pipe(
 *     Match.when(Match.nonEmptyString, (str) => `Valid input: ${str}`),
 *     Match.orElse(() => "Input cannot be empty")
 *   )
 *
 * console.log(processInput("hello"))
 * // Output: "Valid input: hello"
 *
 * console.log(processInput(""))
 * // Output: "Input cannot be empty"
 *
 * console.log(processInput("   "))
 * // Output: "Valid input:    " (whitespace-only strings are considered non-empty)
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
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as MatchModule from "effect/Match";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "nonEmptyString";
const exportKind = "const";
const moduleImportPath = "effect/Match";
const sourceSummary = "Matches non-empty strings.";
const sourceExample =
  'import { Match } from "effect"\n\nconst processInput = Match.type<string>()\n  .pipe(\n    Match.when(Match.nonEmptyString, (str) => `Valid input: ${str}`),\n    Match.orElse(() => "Input cannot be empty")\n  )\n\nconsole.log(processInput("hello"))\n// Output: "Valid input: hello"\n\nconsole.log(processInput(""))\n// Output: "Input cannot be empty"\n\nconsole.log(processInput("   "))\n// Output: "Valid input:    " (whitespace-only strings are considered non-empty)';
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
