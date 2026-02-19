/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Match
 * Export: when
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Match.ts
 * Generated: 2026-02-19T04:50:37.673Z
 *
 * Overview:
 * Defines a condition for matching values.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Match } from "effect"
 *
 * // Create a matcher for objects with an "age" property
 * const match = Match.type<{ age: number }>().pipe(
 *   // Match when age is greater than 18
 *   Match.when(
 *     { age: (age: number) => age > 18 },
 *     (user: { age: number }) => `Age: ${user.age}`
 *   ),
 *   // Match when age is exactly 18
 *   Match.when({ age: 18 }, () => "You can vote"),
 *   // Fallback case for all other ages
 *   Match.orElse((user: { age: number }) => `${user.age} is too young`)
 * )
 *
 * console.log(match({ age: 20 }))
 * // Output: "Age: 20"
 *
 * console.log(match({ age: 18 }))
 * // Output: "You can vote"
 *
 * console.log(match({ age: 4 }))
 * // Output: "4 is too young"
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
const exportName = "when";
const exportKind = "const";
const moduleImportPath = "effect/Match";
const sourceSummary = "Defines a condition for matching values.";
const sourceExample =
  'import { Match } from "effect"\n\n// Create a matcher for objects with an "age" property\nconst match = Match.type<{ age: number }>().pipe(\n  // Match when age is greater than 18\n  Match.when(\n    { age: (age: number) => age > 18 },\n    (user: { age: number }) => `Age: ${user.age}`\n  ),\n  // Match when age is exactly 18\n  Match.when({ age: 18 }, () => "You can vote"),\n  // Fallback case for all other ages\n  Match.orElse((user: { age: number }) => `${user.age} is too young`)\n)\n\nconsole.log(match({ age: 20 }))\n// Output: "Age: 20"\n\nconsole.log(match({ age: 18 }))\n// Output: "You can vote"\n\nconsole.log(match({ age: 4 }))\n// Output: "4 is too young"';
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
