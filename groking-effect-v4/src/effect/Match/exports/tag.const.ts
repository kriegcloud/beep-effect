/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Match
 * Export: tag
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Match.ts
 * Generated: 2026-02-19T04:50:37.671Z
 *
 * Overview:
 * The `Match.tag` function allows pattern matching based on the `_tag` field in a [Discriminated Union](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes-func.html#discriminated-unions). You can specify multiple tags to match within a single pattern.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Match } from "effect"
 *
 * type Event =
 *   | { readonly _tag: "fetch" }
 *   | { readonly _tag: "success"; readonly data: string }
 *   | { readonly _tag: "error"; readonly error: Error }
 *   | { readonly _tag: "cancel" }
 *
 * const match = Match.type<Event>().pipe(
 *   // Match either "fetch" or "success"
 *   Match.tag("fetch", "success", () => `Ok!`),
 *   // Match "error" and extract the error message
 *   Match.tag("error", (event) => `Error: ${event.error.message}`),
 *   // Match "cancel"
 *   Match.tag("cancel", () => "Cancelled"),
 *   Match.exhaustive
 * )
 *
 * console.log(match({ _tag: "success", data: "Hello" }))
 * // Output: "Ok!"
 *
 * console.log(match({ _tag: "error", error: new Error("Oops!") }))
 * // Output: "Error: Oops!"
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
const exportName = "tag";
const exportKind = "const";
const moduleImportPath = "effect/Match";
const sourceSummary =
  "The `Match.tag` function allows pattern matching based on the `_tag` field in a [Discriminated Union](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes-func.h...";
const sourceExample =
  'import { Match } from "effect"\n\ntype Event =\n  | { readonly _tag: "fetch" }\n  | { readonly _tag: "success"; readonly data: string }\n  | { readonly _tag: "error"; readonly error: Error }\n  | { readonly _tag: "cancel" }\n\nconst match = Match.type<Event>().pipe(\n  // Match either "fetch" or "success"\n  Match.tag("fetch", "success", () => `Ok!`),\n  // Match "error" and extract the error message\n  Match.tag("error", (event) => `Error: ${event.error.message}`),\n  // Match "cancel"\n  Match.tag("cancel", () => "Cancelled"),\n  Match.exhaustive\n)\n\nconsole.log(match({ _tag: "success", data: "Hello" }))\n// Output: "Ok!"\n\nconsole.log(match({ _tag: "error", error: new Error("Oops!") }))\n// Output: "Error: Oops!"';
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
