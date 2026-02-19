/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Tuple
 * Export: makeReducer
 * Kind: function
 * Source: .repos/effect-smol/packages/effect/src/Tuple.ts
 * Generated: 2026-02-19T04:14:22.584Z
 *
 * Overview:
 * Creates a `Reducer` for a tuple shape by providing a `Reducer` for each position. The initial value is derived from each position's `Reducer.initialValue`. When reducing a collection of tuples, each element is combined independently.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Number, String, Tuple } from "effect"
 * 
 * const R = Tuple.makeReducer<readonly [number, string]>([
 *   Number.ReducerSum,
 *   String.ReducerConcat
 * ])
 * 
 * const result = R.combineAll([
 *   [1, "a"],
 *   [2, "b"],
 *   [3, "c"]
 * ])
 * console.log(result) // [6, "abc"]
 * ```
 *
 * Focus:
 * - Function export exploration with focused runtime examples.
 */
import * as Effect from "effect/Effect";
import * as Console from "effect/Console";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as TupleModule from "effect/Tuple";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "makeReducer";
const exportKind = "function";
const moduleImportPath = "effect/Tuple";
const sourceSummary = "Creates a `Reducer` for a tuple shape by providing a `Reducer` for each position. The initial value is derived from each position's `Reducer.initialValue`. When reducing a colle...";
const sourceExample = "import { Number, String, Tuple } from \"effect\"\n\nconst R = Tuple.makeReducer<readonly [number, string]>([\n  Number.ReducerSum,\n  String.ReducerConcat\n])\n\nconst result = R.combineAll([\n  [1, \"a\"],\n  [2, \"b\"],\n  [3, \"c\"]\n])\nconsole.log(result) // [6, \"abc\"]";
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
