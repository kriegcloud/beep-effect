/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/NullOr
 * Export: makeReducerFailFast
 * Kind: function
 * Source: .repos/effect-smol/packages/effect/src/NullOr.ts
 * Generated: 2026-02-19T04:50:37.928Z
 *
 * Overview:
 * Creates a `Reducer` for `NullOr<A>` by wrapping an existing `Reducer` with fail-fast semantics for `NullOr` values.
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
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as NullOrModule from "effect/NullOr";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "makeReducerFailFast";
const exportKind = "function";
const moduleImportPath = "effect/NullOr";
const sourceSummary =
  "Creates a `Reducer` for `NullOr<A>` by wrapping an existing `Reducer` with fail-fast semantics for `NullOr` values.";
const sourceExample = "";
const moduleRecord = NullOrModule as Record<string, unknown>;

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
