/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Match
 * Export: type
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Match.ts
 * Generated: 2026-02-19T04:50:37.671Z
 *
 * Overview:
 * Creates a matcher for a specific type.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Match } from "effect"
 *
 * // Create a matcher for values that are either strings or numbers
 * //
 * //      ┌─── (u: string | number) => string
 * //      ▼
 * const match = Match.type<string | number>().pipe(
 *   // Match when the value is a number
 *   Match.when(Match.number, (n) => `number: ${n}`),
 *   // Match when the value is a string
 *   Match.when(Match.string, (s) => `string: ${s}`),
 *   // Ensure all possible cases are handled
 *   Match.exhaustive
 * )
 *
 * console.log(match(0))
 * // Output: "number: 0"
 *
 * console.log(match("hello"))
 * // Output: "string: hello"
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
const exportName = "type";
const exportKind = "const";
const moduleImportPath = "effect/Match";
const sourceSummary = "Creates a matcher for a specific type.";
const sourceExample =
  'import { Match } from "effect"\n\n// Create a matcher for values that are either strings or numbers\n//\n//      ┌─── (u: string | number) => string\n//      ▼\nconst match = Match.type<string | number>().pipe(\n  // Match when the value is a number\n  Match.when(Match.number, (n) => `number: ${n}`),\n  // Match when the value is a string\n  Match.when(Match.string, (s) => `string: ${s}`),\n  // Ensure all possible cases are handled\n  Match.exhaustive\n)\n\nconsole.log(match(0))\n// Output: "number: 0"\n\nconsole.log(match("hello"))\n// Output: "string: hello"';
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
