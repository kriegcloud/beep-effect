/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Match
 * Export: record
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Match.ts
 * Generated: 2026-02-19T04:50:37.671Z
 *
 * Overview:
 * Matches objects where keys are `string` or `symbol` and values are `unknown`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Match } from "effect"
 *
 * const analyzeValue = Match.type<unknown>().pipe(
 *   Match.when(Match.record, (obj) => {
 *     const keys = Object.keys(obj)
 *     const valueCount = keys.length
 *     return `Object with ${valueCount} properties: [${keys.join(", ")}]`
 *   }),
 *   Match.when(
 *     Match.instanceOf(Array),
 *     (arr) => `Array with ${arr.length} items`
 *   ),
 *   Match.when(Match.date, () => "Date object"),
 *   Match.orElse(() => "Not an object")
 * )
 *
 * console.log(analyzeValue({ name: "Alice", age: 30 }))
 * // "Object with 2 properties: [name, age]"
 * console.log(analyzeValue([1, 2, 3]))
 * // "Array with 3 items"
 * console.log(analyzeValue(new Date()))
 * // "Date object"
 * console.log(analyzeValue("hello"))
 * // "Not an object"
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
const exportName = "record";
const exportKind = "const";
const moduleImportPath = "effect/Match";
const sourceSummary = "Matches objects where keys are `string` or `symbol` and values are `unknown`.";
const sourceExample =
  'import { Match } from "effect"\n\nconst analyzeValue = Match.type<unknown>().pipe(\n  Match.when(Match.record, (obj) => {\n    const keys = Object.keys(obj)\n    const valueCount = keys.length\n    return `Object with ${valueCount} properties: [${keys.join(", ")}]`\n  }),\n  Match.when(\n    Match.instanceOf(Array),\n    (arr) => `Array with ${arr.length} items`\n  ),\n  Match.when(Match.date, () => "Date object"),\n  Match.orElse(() => "Not an object")\n)\n\nconsole.log(analyzeValue({ name: "Alice", age: 30 }))\n// "Object with 2 properties: [name, age]"\nconsole.log(analyzeValue([1, 2, 3]))\n// "Array with 3 items"\nconsole.log(analyzeValue(new Date()))\n// "Date object"\nconsole.log(analyzeValue("hello"))\n// "Not an object"';
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
