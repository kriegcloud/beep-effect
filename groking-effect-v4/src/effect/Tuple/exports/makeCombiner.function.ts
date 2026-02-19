/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Tuple
 * Export: makeCombiner
 * Kind: function
 * Source: .repos/effect-smol/packages/effect/src/Tuple.ts
 * Generated: 2026-02-19T04:50:43.574Z
 *
 * Overview:
 * Creates a `Combiner` for a tuple shape by providing a `Combiner` for each position. When two tuples are combined, each element is merged using its corresponding combiner.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Number, String, Tuple } from "effect"
 *
 * const C = Tuple.makeCombiner<readonly [number, string]>([
 *   Number.ReducerSum,
 *   String.ReducerConcat
 * ])
 *
 * const result = C.combine([1, "hello"], [2, " world"])
 * console.log(result) // [3, "hello world"]
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
import * as TupleModule from "effect/Tuple";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "makeCombiner";
const exportKind = "function";
const moduleImportPath = "effect/Tuple";
const sourceSummary =
  "Creates a `Combiner` for a tuple shape by providing a `Combiner` for each position. When two tuples are combined, each element is merged using its corresponding combiner.";
const sourceExample =
  'import { Number, String, Tuple } from "effect"\n\nconst C = Tuple.makeCombiner<readonly [number, string]>([\n  Number.ReducerSum,\n  String.ReducerConcat\n])\n\nconst result = C.combine([1, "hello"], [2, " world"])\nconsole.log(result) // [3, "hello world"]';
const moduleRecord = TupleModule as Record<string, unknown>;

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
