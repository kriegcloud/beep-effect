/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Match
 * Export: defined
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Match.ts
 * Generated: 2026-02-19T04:50:37.668Z
 *
 * Overview:
 * Matches any defined (non-null and non-undefined) value.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Match } from "effect"
 *
 * const processValue = Match.type<string | number | null | undefined>()
 *   .pipe(
 *     Match.when(Match.defined, (value) => `Defined value: ${value}`),
 *     Match.orElse(() => "Value is null or undefined")
 *   )
 *
 * console.log(processValue("hello"))
 * // Output: "Defined value: hello"
 *
 * console.log(processValue(42))
 * // Output: "Defined value: 42"
 *
 * console.log(processValue(0))
 * // Output: "Defined value: 0"
 *
 * console.log(processValue(""))
 * // Output: "Defined value: "
 *
 * console.log(processValue(null))
 * // Output: "Value is null or undefined"
 *
 * console.log(processValue(undefined))
 * // Output: "Value is null or undefined"
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
const exportName = "defined";
const exportKind = "const";
const moduleImportPath = "effect/Match";
const sourceSummary = "Matches any defined (non-null and non-undefined) value.";
const sourceExample =
  'import { Match } from "effect"\n\nconst processValue = Match.type<string | number | null | undefined>()\n  .pipe(\n    Match.when(Match.defined, (value) => `Defined value: ${value}`),\n    Match.orElse(() => "Value is null or undefined")\n  )\n\nconsole.log(processValue("hello"))\n// Output: "Defined value: hello"\n\nconsole.log(processValue(42))\n// Output: "Defined value: 42"\n\nconsole.log(processValue(0))\n// Output: "Defined value: 0"\n\nconsole.log(processValue(""))\n// Output: "Defined value: "\n\nconsole.log(processValue(null))\n// Output: "Value is null or undefined"\n\nconsole.log(processValue(undefined))\n// Output: "Value is null or undefined"';
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
