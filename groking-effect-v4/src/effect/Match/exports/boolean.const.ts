/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Match
 * Export: boolean
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Match.ts
 * Generated: 2026-02-19T04:14:14.900Z
 *
 * Overview:
 * Matches values of type `boolean`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Match } from "effect"
 *
 * const describeTruthiness = Match.type<unknown>().pipe(
 *   Match.when(
 *     Match.boolean,
 *     (bool) => bool ? "Definitely true" : "Definitely false"
 *   ),
 *   Match.when(0, () => "Falsy number"),
 *   Match.when("", () => "Empty string"),
 *   Match.when(Match.null, () => "Null value"),
 *   Match.orElse(() => "Some other truthy value")
 * )
 *
 * console.log(describeTruthiness(true)) // "Definitely true"
 * console.log(describeTruthiness(false)) // "Definitely false"
 * console.log(describeTruthiness(0)) // "Falsy number"
 * console.log(describeTruthiness(1)) // "Some other truthy value"
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
const exportName = "boolean";
const exportKind = "const";
const moduleImportPath = "effect/Match";
const sourceSummary = "Matches values of type `boolean`.";
const sourceExample =
  'import { Match } from "effect"\n\nconst describeTruthiness = Match.type<unknown>().pipe(\n  Match.when(\n    Match.boolean,\n    (bool) => bool ? "Definitely true" : "Definitely false"\n  ),\n  Match.when(0, () => "Falsy number"),\n  Match.when("", () => "Empty string"),\n  Match.when(Match.null, () => "Null value"),\n  Match.orElse(() => "Some other truthy value")\n)\n\nconsole.log(describeTruthiness(true)) // "Definitely true"\nconsole.log(describeTruthiness(false)) // "Definitely false"\nconsole.log(describeTruthiness(0)) // "Falsy number"\nconsole.log(describeTruthiness(1)) // "Some other truthy value"';
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
