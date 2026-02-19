/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Equivalence
 * Export: Tuple
 * Kind: function
 * Source: .repos/effect-smol/packages/effect/src/Equivalence.ts
 * Generated: 2026-02-19T04:50:36.032Z
 *
 * Overview:
 * Creates an equivalence for tuples with heterogeneous element types.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Equivalence } from "effect"
 *
 * const stringTupleEq = Equivalence.Tuple([
 *   Equivalence.strictEqual<string>(),
 *   Equivalence.strictEqual<string>(),
 *   Equivalence.strictEqual<string>()
 * ])
 *
 * const tuple1 = ["hello", "world", "test"] as const
 * const tuple2 = ["hello", "world", "test"] as const
 * const tuple3 = ["hello", "world", "different"] as const
 *
 * console.log(stringTupleEq(tuple1, tuple2)) // true
 * console.log(stringTupleEq(tuple1, tuple3)) // false (different third element)
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
import * as EquivalenceModule from "effect/Equivalence";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "Tuple";
const exportKind = "function";
const moduleImportPath = "effect/Equivalence";
const sourceSummary = "Creates an equivalence for tuples with heterogeneous element types.";
const sourceExample =
  'import { Equivalence } from "effect"\n\nconst stringTupleEq = Equivalence.Tuple([\n  Equivalence.strictEqual<string>(),\n  Equivalence.strictEqual<string>(),\n  Equivalence.strictEqual<string>()\n])\n\nconst tuple1 = ["hello", "world", "test"] as const\nconst tuple2 = ["hello", "world", "test"] as const\nconst tuple3 = ["hello", "world", "different"] as const\n\nconsole.log(stringTupleEq(tuple1, tuple2)) // true\nconsole.log(stringTupleEq(tuple1, tuple3)) // false (different third element)';
const moduleRecord = EquivalenceModule as Record<string, unknown>;

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
