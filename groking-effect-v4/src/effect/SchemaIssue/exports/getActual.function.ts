/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/SchemaIssue
 * Export: getActual
 * Kind: function
 * Source: .repos/effect-smol/packages/effect/src/SchemaIssue.ts
 * Generated: 2026-02-19T04:14:19.209Z
 *
 * Overview:
 * Extracts the actual input value from any {@link Issue} variant.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Option, SchemaIssue } from "effect"
 * 
 * const issue = new SchemaIssue.MissingKey(undefined)
 * console.log(SchemaIssue.getActual(issue))
 * // { _tag: "None" }
 * ```
 *
 * Focus:
 * - Function export exploration with focused runtime examples.
 */
import * as Effect from "effect/Effect";
import * as Console from "effect/Console";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as SchemaIssueModule from "effect/SchemaIssue";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "getActual";
const exportKind = "function";
const moduleImportPath = "effect/SchemaIssue";
const sourceSummary = "Extracts the actual input value from any {@link Issue} variant.";
const sourceExample = "import { Option, SchemaIssue } from \"effect\"\n\nconst issue = new SchemaIssue.MissingKey(undefined)\nconsole.log(SchemaIssue.getActual(issue))\n// { _tag: \"None\" }";
const moduleRecord = SchemaIssueModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleFunctionDiscovery = Effect.gen(function* () {
  yield* Console.log("Inspect runtime metadata before attempting invocation.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleFunctionInvocation = Effect.gen(function* () {
  yield* Console.log("Execute a safe zero-arg invocation probe.");
  yield* probeNamedExportFunction({ moduleRecord, exportName });
});

/* ========================================================================== *
 * Program
 * ========================================================================== */
const program = createPlaygroundProgram({
  icon: "🧪",
  moduleImportPath,
  exportName,
  exportKind,
  summary: sourceSummary,
  sourceExample,
  bunContext: BunContext,
  examples: [
    {
      title: "Function Discovery",
      description: "Inspect runtime shape and preview callable details.",
      run: exampleFunctionDiscovery
    },
    {
      title: "Zero-Arg Invocation Probe",
      description: "Attempt invocation and report success/failure details.",
      run: exampleFunctionInvocation
    }
  ]
});

BunRuntime.runMain(program);
