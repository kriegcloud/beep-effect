/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Match
 * Export: is
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Match.ts
 * Generated: 2026-02-19T04:50:37.669Z
 *
 * Overview:
 * Matches a specific set of literal values (e.g., `Match.is("a", 42, true)`).
 *
 * Source JSDoc Example:
 * ```ts
 * import { Match } from "effect"
 *
 * const handleStatus = Match.type<string | number>()
 *   .pipe(
 *     Match.when(Match.is("success", "ok", 200), () => "Operation successful"),
 *     Match.when(Match.is("error", "failed", 500), () => "Operation failed"),
 *     Match.when(Match.is(0, false, null), () => "Falsy value"),
 *     Match.orElse((value) => `Unknown status: ${value}`)
 *   )
 *
 * console.log(handleStatus("success"))
 * // Output: "Operation successful"
 *
 * console.log(handleStatus(200))
 * // Output: "Operation successful"
 *
 * console.log(handleStatus("failed"))
 * // Output: "Operation failed"
 *
 * console.log(handleStatus(0))
 * // Output: "Falsy value"
 *
 * console.log(handleStatus("pending"))
 * // Output: "Unknown status: pending"
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
const exportName = "is";
const exportKind = "const";
const moduleImportPath = "effect/Match";
const sourceSummary = 'Matches a specific set of literal values (e.g., `Match.is("a", 42, true)`).';
const sourceExample =
  'import { Match } from "effect"\n\nconst handleStatus = Match.type<string | number>()\n  .pipe(\n    Match.when(Match.is("success", "ok", 200), () => "Operation successful"),\n    Match.when(Match.is("error", "failed", 500), () => "Operation failed"),\n    Match.when(Match.is(0, false, null), () => "Falsy value"),\n    Match.orElse((value) => `Unknown status: ${value}`)\n  )\n\nconsole.log(handleStatus("success"))\n// Output: "Operation successful"\n\nconsole.log(handleStatus(200))\n// Output: "Operation successful"\n\nconsole.log(handleStatus("failed"))\n// Output: "Operation failed"\n\nconsole.log(handleStatus(0))\n// Output: "Falsy value"\n\nconsole.log(handleStatus("pending"))\n// Output: "Unknown status: pending"';
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
