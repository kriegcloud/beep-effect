/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/SchemaAST
 * Export: isPattern
 * Kind: function
 * Source: .repos/effect-smol/packages/effect/src/SchemaAST.ts
 * Generated: 2026-02-19T04:50:40.336Z
 *
 * Overview:
 * Creates a {@link Filter} that validates strings against a regular expression.
 *
 * Source JSDoc Example:
 * ```ts
 * import { SchemaAST } from "effect"
 *
 * const emailFilter = SchemaAST.isPattern(/^[^@]+@[^@]+$/)
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
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as SchemaASTModule from "effect/SchemaAST";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "isPattern";
const exportKind = "function";
const moduleImportPath = "effect/SchemaAST";
const sourceSummary = "Creates a {@link Filter} that validates strings against a regular expression.";
const sourceExample = 'import { SchemaAST } from "effect"\n\nconst emailFilter = SchemaAST.isPattern(/^[^@]+@[^@]+$/)';
const moduleRecord = SchemaASTModule as Record<string, unknown>;

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
