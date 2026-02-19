/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/SchemaIssue
 * Export: Filter
 * Kind: class
 * Source: .repos/effect-smol/packages/effect/src/SchemaIssue.ts
 * Generated: 2026-02-19T04:14:19.209Z
 *
 * Overview:
 * Issue produced when a schema filter (refinement check) fails.
 *
 * Source JSDoc Example:
 * ```ts
 * import { SchemaIssue } from "effect"
 * 
 * function describe(issue: SchemaIssue.Issue): string {
 *   if (issue._tag === "Filter") {
 *     return `Filter failed on: ${JSON.stringify(issue.actual)}`
 *   }
 *   return String(issue)
 * }
 * ```
 *
 * Focus:
 * - Class export exploration with focused runtime examples.
 */
import * as Effect from "effect/Effect";
import * as Console from "effect/Console";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as SchemaIssueModule from "effect/SchemaIssue";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportConstructor
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "Filter";
const exportKind = "class";
const moduleImportPath = "effect/SchemaIssue";
const sourceSummary = "Issue produced when a schema filter (refinement check) fails.";
const sourceExample = "import { SchemaIssue } from \"effect\"\n\nfunction describe(issue: SchemaIssue.Issue): string {\n  if (issue._tag === \"Filter\") {\n    return `Filter failed on: ${JSON.stringify(issue.actual)}`\n  }\n  return String(issue)\n}";
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
  bunContext: BunContext,
  examples: [
    {
      title: "Class Discovery",
      description: "Inspect runtime shape and discover class metadata.",
      run: exampleClassDiscovery
    },
    {
      title: "Zero-Arg Construction Probe",
      description: "Attempt construction and report constructor behavior.",
      run: exampleConstructionProbe
    }
  ]
});

BunRuntime.runMain(program);
