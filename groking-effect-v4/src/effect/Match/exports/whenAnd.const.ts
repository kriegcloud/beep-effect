/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Match
 * Export: whenAnd
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Match.ts
 * Generated: 2026-02-19T04:50:37.673Z
 *
 * Overview:
 * Matches a value that satisfies all provided patterns.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Match } from "effect"
 *
 * type User = { readonly age: number; readonly role: "admin" | "user" }
 *
 * const checkUser = Match.type<User>().pipe(
 *   Match.whenAnd(
 *     { age: (n) => n >= 18 },
 *     { role: "admin" },
 *     () => "Admin access granted"
 *   ),
 *   Match.orElse(() => "Access denied")
 * )
 *
 * console.log(checkUser({ age: 20, role: "admin" }))
 * // Output: "Admin access granted"
 *
 * console.log(checkUser({ age: 20, role: "user" }))
 * // Output: "Access denied"
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
const exportName = "whenAnd";
const exportKind = "const";
const moduleImportPath = "effect/Match";
const sourceSummary = "Matches a value that satisfies all provided patterns.";
const sourceExample =
  'import { Match } from "effect"\n\ntype User = { readonly age: number; readonly role: "admin" | "user" }\n\nconst checkUser = Match.type<User>().pipe(\n  Match.whenAnd(\n    { age: (n) => n >= 18 },\n    { role: "admin" },\n    () => "Admin access granted"\n  ),\n  Match.orElse(() => "Access denied")\n)\n\nconsole.log(checkUser({ age: 20, role: "admin" }))\n// Output: "Admin access granted"\n\nconsole.log(checkUser({ age: 20, role: "user" }))\n// Output: "Access denied"';
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
