/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Predicate
 * Export: some
 * Kind: function
 * Source: .repos/effect-smol/packages/effect/src/Predicate.ts
 * Generated: 2026-02-19T04:14:15.913Z
 *
 * Overview:
 * Creates a predicate that returns `true` if any predicate in the collection returns `true`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Predicate } from "effect"
 *
 * const anyCheck = Predicate.some([Predicate.isString, Predicate.isNumber])
 *
 * console.log(anyCheck("ok"))
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
import * as PredicateModule from "effect/Predicate";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "some";
const exportKind = "function";
const moduleImportPath = "effect/Predicate";
const sourceSummary = "Creates a predicate that returns `true` if any predicate in the collection returns `true`.";
const sourceExample =
  'import { Predicate } from "effect"\n\nconst anyCheck = Predicate.some([Predicate.isString, Predicate.isNumber])\n\nconsole.log(anyCheck("ok"))';
const moduleRecord = PredicateModule as Record<string, unknown>;

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
