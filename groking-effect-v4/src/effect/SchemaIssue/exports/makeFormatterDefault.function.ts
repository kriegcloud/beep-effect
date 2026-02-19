/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/SchemaIssue
 * Export: makeFormatterDefault
 * Kind: function
 * Source: .repos/effect-smol/packages/effect/src/SchemaIssue.ts
 * Generated: 2026-02-19T04:14:19.209Z
 *
 * Overview:
 * Creates a {@link Formatter} that converts an {@link Issue} into a human-readable multi-line string.
 *
 * Source JSDoc Example:
 * ```ts
 * import { SchemaIssue } from "effect"
 *
 * const formatter = SchemaIssue.makeFormatterDefault()
 * ```
 *
 * Focus:
 * - Function export exploration with focused runtime examples.
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
import * as SchemaIssueModule from "effect/SchemaIssue";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "makeFormatterDefault";
const exportKind = "function";
const moduleImportPath = "effect/SchemaIssue";
const sourceSummary =
  "Creates a {@link Formatter} that converts an {@link Issue} into a human-readable multi-line string.";
const sourceExample = 'import { SchemaIssue } from "effect"\n\nconst formatter = SchemaIssue.makeFormatterDefault()';
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
      run: exampleFunctionDiscovery,
    },
    {
      title: "Zero-Arg Invocation Probe",
      description: "Attempt invocation and report success/failure details.",
      run: exampleFunctionInvocation,
    },
  ],
});

BunRuntime.runMain(program);
