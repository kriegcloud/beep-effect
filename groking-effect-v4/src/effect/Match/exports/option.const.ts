/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Match
 * Export: option
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Match.ts
 * Generated: 2026-02-19T04:14:14.901Z
 *
 * Overview:
 * Wraps the match result in an `Option`, representing an optional match.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Match } from "effect"
 *
 * type User = { readonly role: "admin" | "editor" | "viewer" }
 *
 * // Create a matcher to extract user roles
 * const getRole = Match.type<User>().pipe(
 *   Match.when({ role: "admin" }, () => "Has full access"),
 *   Match.when({ role: "editor" }, () => "Can edit content"),
 *   Match.option // Wrap the result in an Option
 * )
 *
 * console.log(getRole({ role: "admin" }))
 * // Output: { _id: 'Option', _tag: 'Some', value: 'Has full access' }
 *
 * console.log(getRole({ role: "viewer" }))
 * // Output: { _id: 'Option', _tag: 'None' }
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
const exportName = "option";
const exportKind = "const";
const moduleImportPath = "effect/Match";
const sourceSummary = "Wraps the match result in an `Option`, representing an optional match.";
const sourceExample =
  'import { Match } from "effect"\n\ntype User = { readonly role: "admin" | "editor" | "viewer" }\n\n// Create a matcher to extract user roles\nconst getRole = Match.type<User>().pipe(\n  Match.when({ role: "admin" }, () => "Has full access"),\n  Match.when({ role: "editor" }, () => "Can edit content"),\n  Match.option // Wrap the result in an Option\n)\n\nconsole.log(getRole({ role: "admin" }))\n// Output: { _id: \'Option\', _tag: \'Some\', value: \'Has full access\' }\n\nconsole.log(getRole({ role: "viewer" }))\n// Output: { _id: \'Option\', _tag: \'None\' }';
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
