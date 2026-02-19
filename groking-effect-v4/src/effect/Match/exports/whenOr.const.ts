/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Match
 * Export: whenOr
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Match.ts
 * Generated: 2026-02-19T04:50:37.673Z
 *
 * Overview:
 * Matches one of multiple patterns in a single condition.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Match } from "effect"
 *
 * type ErrorType =
 *   | { readonly _tag: "NetworkError"; readonly message: string }
 *   | { readonly _tag: "TimeoutError"; readonly duration: number }
 *   | { readonly _tag: "ValidationError"; readonly field: string }
 *
 * const handleError = Match.type<ErrorType>().pipe(
 *   Match.whenOr(
 *     { _tag: "NetworkError" },
 *     { _tag: "TimeoutError" },
 *     () => "Retry the request"
 *   ),
 *   Match.when({ _tag: "ValidationError" }, (_) => `Invalid field: ${_.field}`),
 *   Match.exhaustive
 * )
 *
 * console.log(handleError({ _tag: "NetworkError", message: "No connection" }))
 * // Output: "Retry the request"
 *
 * console.log(handleError({ _tag: "ValidationError", field: "email" }))
 * // Output: "Invalid field: email"
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
const exportName = "whenOr";
const exportKind = "const";
const moduleImportPath = "effect/Match";
const sourceSummary = "Matches one of multiple patterns in a single condition.";
const sourceExample =
  'import { Match } from "effect"\n\ntype ErrorType =\n  | { readonly _tag: "NetworkError"; readonly message: string }\n  | { readonly _tag: "TimeoutError"; readonly duration: number }\n  | { readonly _tag: "ValidationError"; readonly field: string }\n\nconst handleError = Match.type<ErrorType>().pipe(\n  Match.whenOr(\n    { _tag: "NetworkError" },\n    { _tag: "TimeoutError" },\n    () => "Retry the request"\n  ),\n  Match.when({ _tag: "ValidationError" }, (_) => `Invalid field: ${_.field}`),\n  Match.exhaustive\n)\n\nconsole.log(handleError({ _tag: "NetworkError", message: "No connection" }))\n// Output: "Retry the request"\n\nconsole.log(handleError({ _tag: "ValidationError", field: "email" }))\n// Output: "Invalid field: email"';
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
