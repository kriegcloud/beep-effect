/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/UndefinedOr
 * Export: makeReducer
 * Kind: function
 * Source: .repos/effect-smol/packages/effect/src/UndefinedOr.ts
 * Generated: 2026-02-19T04:14:23.513Z
 *
 * Overview:
 * Creates a `Reducer` for `UndefinedOr<A>` that prioritizes the first non-`undefined` value and combines values when both operands are present.
 *
 * Source JSDoc Example:
 * (No inline example was found in the source JSDoc.)
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
import * as UndefinedOrModule from "effect/UndefinedOr";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "makeReducer";
const exportKind = "function";
const moduleImportPath = "effect/UndefinedOr";
const sourceSummary =
  "Creates a `Reducer` for `UndefinedOr<A>` that prioritizes the first non-`undefined` value and combines values when both operands are present.";
const sourceExample = "";
const moduleRecord = UndefinedOrModule as Record<string, unknown>;

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
