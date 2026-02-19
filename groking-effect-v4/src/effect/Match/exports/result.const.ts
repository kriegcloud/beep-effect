/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Match
 * Export: result
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Match.ts
 * Generated: 2026-02-19T04:14:14.901Z
 *
 * Overview:
 * Wraps the match result in a `Result`, distinguishing matched and unmatched cases.
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
 *   Match.result // Wrap the result in an Result
 * )
 *
 * console.log(getRole({ role: "admin" }))
 * // Output: { _id: 'Result', _tag: 'Ok', ok: 'Has full access' }
 *
 * console.log(getRole({ role: "viewer" }))
 * // Output: { _id: 'Result', _tag: 'Err', err: { role: 'viewer' } }
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
const exportName = "result";
const exportKind = "const";
const moduleImportPath = "effect/Match";
const sourceSummary = "Wraps the match result in a `Result`, distinguishing matched and unmatched cases.";
const sourceExample =
  'import { Match } from "effect"\n\ntype User = { readonly role: "admin" | "editor" | "viewer" }\n\n// Create a matcher to extract user roles\nconst getRole = Match.type<User>().pipe(\n  Match.when({ role: "admin" }, () => "Has full access"),\n  Match.when({ role: "editor" }, () => "Can edit content"),\n  Match.result // Wrap the result in an Result\n)\n\nconsole.log(getRole({ role: "admin" }))\n// Output: { _id: \'Result\', _tag: \'Ok\', ok: \'Has full access\' }\n\nconsole.log(getRole({ role: "viewer" }))\n// Output: { _id: \'Result\', _tag: \'Err\', err: { role: \'viewer\' } }';
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
