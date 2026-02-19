/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Match
 * Export: any
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Match.ts
 * Generated: 2026-02-19T04:14:14.900Z
 *
 * Overview:
 * Matches any value without restrictions.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Match } from "effect"
 *
 * const describeValue = Match.type<unknown>()
 *   .pipe(
 *     Match.when(Match.string, (str) => `String: ${str}`),
 *     Match.when(Match.number, (num) => `Number: ${num}`),
 *     Match.when(Match.boolean, (bool) => `Boolean: ${bool}`),
 *     Match.when(Match.any, (value) => `Other: ${typeof value}`),
 *     Match.exhaustive
 *   )
 *
 * console.log(describeValue("hello"))
 * // Output: "String: hello"
 *
 * console.log(describeValue(42))
 * // Output: "Number: 42"
 *
 * console.log(describeValue([1, 2, 3]))
 * // Output: "Other: object"
 *
 * console.log(describeValue(null))
 * // Output: "Other: object"
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
const exportName = "any";
const exportKind = "const";
const moduleImportPath = "effect/Match";
const sourceSummary = "Matches any value without restrictions.";
const sourceExample =
  'import { Match } from "effect"\n\nconst describeValue = Match.type<unknown>()\n  .pipe(\n    Match.when(Match.string, (str) => `String: ${str}`),\n    Match.when(Match.number, (num) => `Number: ${num}`),\n    Match.when(Match.boolean, (bool) => `Boolean: ${bool}`),\n    Match.when(Match.any, (value) => `Other: ${typeof value}`),\n    Match.exhaustive\n  )\n\nconsole.log(describeValue("hello"))\n// Output: "String: hello"\n\nconsole.log(describeValue(42))\n// Output: "Number: 42"\n\nconsole.log(describeValue([1, 2, 3]))\n// Output: "Other: object"\n\nconsole.log(describeValue(null))\n// Output: "Other: object"';
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
