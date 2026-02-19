/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Equivalence
 * Export: Array
 * Kind: function
 * Source: .repos/effect-smol/packages/effect/src/Equivalence.ts
 * Generated: 2026-02-19T04:14:12.630Z
 *
 * Overview:
 * Creates an equivalence for arrays where all elements are compared using the same equivalence.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Equivalence } from "effect"
 *
 * const numberArrayEq = Equivalence.Array(Equivalence.strictEqual<number>())
 *
 * console.log(numberArrayEq([1, 2, 3], [1, 2, 3])) // true
 * console.log(numberArrayEq([1, 2, 3], [1, 2, 4])) // false
 * console.log(numberArrayEq([1, 2], [1, 2, 3])) // false (different length)
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
import * as EquivalenceModule from "effect/Equivalence";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "Array";
const exportKind = "function";
const moduleImportPath = "effect/Equivalence";
const sourceSummary = "Creates an equivalence for arrays where all elements are compared using the same equivalence.";
const sourceExample =
  'import { Equivalence } from "effect"\n\nconst numberArrayEq = Equivalence.Array(Equivalence.strictEqual<number>())\n\nconsole.log(numberArrayEq([1, 2, 3], [1, 2, 3])) // true\nconsole.log(numberArrayEq([1, 2, 3], [1, 2, 4])) // false\nconsole.log(numberArrayEq([1, 2], [1, 2, 3])) // false (different length)';
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
