/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/SchemaIssue
 * Export: InvalidValue
 * Kind: class
 * Source: .repos/effect-smol/packages/effect/src/SchemaIssue.ts
 * Generated: 2026-02-19T04:50:40.381Z
 *
 * Overview:
 * Issue produced when the input has the correct type but its value violates a constraint (e.g. a string that is too short, a number out of range).
 *
 * Source JSDoc Example:
 * ```ts
 * import { Option, SchemaIssue } from "effect"
 *
 * const issue = new SchemaIssue.InvalidValue(
 *   Option.some(""),
 *   { message: "must not be empty" }
 * )
 * console.log(String(issue))
 * // "must not be empty"
 * ```
 *
 * Focus:
 * - Class export exploration with focused runtime examples.
 */

import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportConstructor,
} from "@beep/groking-effect-v4/runtime/Playground";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as SchemaIssueModule from "effect/SchemaIssue";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "InvalidValue";
const exportKind = "class";
const moduleImportPath = "effect/SchemaIssue";
const sourceSummary =
  "Issue produced when the input has the correct type but its value violates a constraint (e.g. a string that is too short, a number out of range).";
const sourceExample =
  'import { Option, SchemaIssue } from "effect"\n\nconst issue = new SchemaIssue.InvalidValue(\n  Option.some(""),\n  { message: "must not be empty" }\n)\nconsole.log(String(issue))\n// "must not be empty"';
const moduleRecord = SchemaIssueModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleClassDiscovery = Effect.gen(function* () {
  yield* Console.log("Inspect runtime metadata and class-like surface information.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleConstructionProbe = Effect.gen(function* () {
  yield* Console.log("Attempt a zero-arg construction probe.");
  yield* probeNamedExportConstructor({ moduleRecord, exportName });
});

/* ========================================================================== *
 * Program
 * ========================================================================== */
const program = createPlaygroundProgram({
  icon: "🧱",
  moduleImportPath,
  exportName,
  exportKind,
  summary: sourceSummary,
  sourceExample,
  examples: [
    {
      title: "Class Discovery",
      description: "Inspect runtime shape and discover class metadata.",
      run: exampleClassDiscovery,
    },
    {
      title: "Zero-Arg Construction Probe",
      description: "Attempt construction and report constructor behavior.",
      run: exampleConstructionProbe,
    },
  ],
});

BunRuntime.runMain(program);
