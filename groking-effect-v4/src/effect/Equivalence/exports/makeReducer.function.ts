/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Equivalence
 * Export: makeReducer
 * Kind: function
 * Source: .repos/effect-smol/packages/effect/src/Equivalence.ts
 * Generated: 2026-02-19T04:50:36.032Z
 *
 * Overview:
 * Creates a `Reducer` for combining `Equivalence` instances, useful for aggregating equivalences in collections.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Equivalence } from "effect"
 *
 * const reducer = Equivalence.makeReducer<number>()
 * const equivalences = [
 *   Equivalence.strictEqual<number>(),
 *   Equivalence.make<number>((a, b) => Math.abs(a - b) < 1)
 * ]
 *
 * const combined = reducer.combineAll(equivalences)
 * // Combined equivalence requires both conditions to be true
 * console.log(combined(1, 1)) // true (strict equal)
 * console.log(combined(1, 1.5)) // false (strict equal fails)
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
const exportName = "makeReducer";
const exportKind = "function";
const moduleImportPath = "effect/Equivalence";
const sourceSummary =
  "Creates a `Reducer` for combining `Equivalence` instances, useful for aggregating equivalences in collections.";
const sourceExample =
  'import { Equivalence } from "effect"\n\nconst reducer = Equivalence.makeReducer<number>()\nconst equivalences = [\n  Equivalence.strictEqual<number>(),\n  Equivalence.make<number>((a, b) => Math.abs(a - b) < 1)\n]\n\nconst combined = reducer.combineAll(equivalences)\n// Combined equivalence requires both conditions to be true\nconsole.log(combined(1, 1)) // true (strict equal)\nconsole.log(combined(1, 1.5)) // false (strict equal fails)';
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
