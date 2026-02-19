/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Match
 * Export: typeTags
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Match.ts
 * Generated: 2026-02-19T04:50:37.671Z
 *
 * Overview:
 * Creates a type-safe match function for discriminated unions based on `_tag` field.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Match } from "effect"
 *
 * type Result =
 *   | { readonly _tag: "Success"; readonly data: string }
 *   | { readonly _tag: "Error"; readonly message: string }
 *   | { readonly _tag: "Loading" }
 *
 * // Create a matcher with specific return type
 * const formatResult = Match.typeTags<Result, string>()({
 *   Success: (result) => `Data: ${result.data}`,
 *   Error: (result) => `Error: ${result.message}`,
 *   Loading: () => "Loading..."
 * })
 *
 * console.log(formatResult({ _tag: "Success", data: "Hello World" }))
 * // Output: "Data: Hello World"
 *
 * console.log(formatResult({ _tag: "Error", message: "Network failed" }))
 * // Output: "Error: Network failed"
 *
 * // Create a matcher with inferred return type
 * const processResult = Match.typeTags<Result>()({
 *   Success: (result) => ({ type: "ok", value: result.data }),
 *   Error: (result) => ({ type: "error", error: result.message }),
 *   Loading: () => ({ type: "pending" })
 * })
 *
 * console.log(processResult({ _tag: "Loading" }))
 * // Output: { type: "pending" }
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
const exportName = "typeTags";
const exportKind = "const";
const moduleImportPath = "effect/Match";
const sourceSummary = "Creates a type-safe match function for discriminated unions based on `_tag` field.";
const sourceExample =
  'import { Match } from "effect"\n\ntype Result =\n  | { readonly _tag: "Success"; readonly data: string }\n  | { readonly _tag: "Error"; readonly message: string }\n  | { readonly _tag: "Loading" }\n\n// Create a matcher with specific return type\nconst formatResult = Match.typeTags<Result, string>()({\n  Success: (result) => `Data: ${result.data}`,\n  Error: (result) => `Error: ${result.message}`,\n  Loading: () => "Loading..."\n})\n\nconsole.log(formatResult({ _tag: "Success", data: "Hello World" }))\n// Output: "Data: Hello World"\n\nconsole.log(formatResult({ _tag: "Error", message: "Network failed" }))\n// Output: "Error: Network failed"\n\n// Create a matcher with inferred return type\nconst processResult = Match.typeTags<Result>()({\n  Success: (result) => ({ type: "ok", value: result.data }),\n  Error: (result) => ({ type: "error", error: result.message }),\n  Loading: () => ({ type: "pending" })\n})\n\nconsole.log(processResult({ _tag: "Loading" }))\n// Output: { type: "pending" }';
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
