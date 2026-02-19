/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Struct
 * Export: makeReducer
 * Kind: function
 * Source: .repos/effect-smol/packages/effect/src/Struct.ts
 * Generated: 2026-02-19T04:14:21.492Z
 *
 * Overview:
 * Creates a `Reducer` for a struct shape by providing a `Reducer` for each property. The initial value is derived from each property's `Reducer.initialValue`. When reducing a collection of structs, each property is combined independently.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Number, String, Struct } from "effect"
 *
 * const R = Struct.makeReducer<{ readonly n: number; readonly s: string }>({
 *   n: Number.ReducerSum,
 *   s: String.ReducerConcat
 * })
 *
 * const result = R.combineAll([
 *   { n: 1, s: "a" },
 *   { n: 2, s: "b" },
 *   { n: 3, s: "c" }
 * ])
 * console.log(result) // { n: 6, s: "abc" }
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
import * as StructModule from "effect/Struct";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "makeReducer";
const exportKind = "function";
const moduleImportPath = "effect/Struct";
const sourceSummary =
  "Creates a `Reducer` for a struct shape by providing a `Reducer` for each property. The initial value is derived from each property's `Reducer.initialValue`. When reducing a coll...";
const sourceExample =
  'import { Number, String, Struct } from "effect"\n\nconst R = Struct.makeReducer<{ readonly n: number; readonly s: string }>({\n  n: Number.ReducerSum,\n  s: String.ReducerConcat\n})\n\nconst result = R.combineAll([\n  { n: 1, s: "a" },\n  { n: 2, s: "b" },\n  { n: 3, s: "c" }\n])\nconsole.log(result) // { n: 6, s: "abc" }';
const moduleRecord = StructModule as Record<string, unknown>;

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
