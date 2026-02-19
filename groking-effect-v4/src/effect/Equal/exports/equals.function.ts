/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Equal
 * Export: equals
 * Kind: function
 * Source: .repos/effect-smol/packages/effect/src/Equal.ts
 * Generated: 2026-02-19T04:14:12.620Z
 *
 * Overview:
 * Compares two values for structural equality. Returns `true` if the values are structurally equal, `false` otherwise.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Equal } from "effect"
 * import * as assert from "node:assert"
 *
 * // Primitive values
 * assert(Equal.equals(1, 1) === true)
 * assert(Equal.equals(NaN, NaN) === true)
 *
 * // Objects - structural comparison
 * assert(Equal.equals({ a: 1, b: 2 }, { a: 1, b: 2 }) === true)
 * assert(Equal.equals({ a: 1 }, { a: 1, b: 2 }) === false)
 *
 * // Arrays - recursive comparison
 * assert(Equal.equals([1, [2, 3]], [1, [2, 3]]) === true)
 * assert(Equal.equals([1, 2], [1, 3]) === false)
 *
 * // Date equality by ISO string
 * const date1 = new Date("2023-01-01")
 * const date2 = new Date("2023-01-01")
 * assert(Equal.equals(date1, date2) === true)
 *
 * // Maps and Sets - structural comparison
 * const map1 = new Map([["a", 1], ["b", 2]])
 * const map2 = new Map([["b", 2], ["a", 1]]) // different order
 * assert(Equal.equals(map1, map2) === true)
 *
 * // Curried version
 * const isEqualTo5 = Equal.equals(5)
 * assert(isEqualTo5(5) === true)
 * assert(isEqualTo5(3) === false)
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
import * as EqualModule from "effect/Equal";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "equals";
const exportKind = "function";
const moduleImportPath = "effect/Equal";
const sourceSummary =
  "Compares two values for structural equality. Returns `true` if the values are structurally equal, `false` otherwise.";
const sourceExample =
  'import { Equal } from "effect"\nimport * as assert from "node:assert"\n\n// Primitive values\nassert(Equal.equals(1, 1) === true)\nassert(Equal.equals(NaN, NaN) === true)\n\n// Objects - structural comparison\nassert(Equal.equals({ a: 1, b: 2 }, { a: 1, b: 2 }) === true)\nassert(Equal.equals({ a: 1 }, { a: 1, b: 2 }) === false)\n\n// Arrays - recursive comparison\nassert(Equal.equals([1, [2, 3]], [1, [2, 3]]) === true)\nassert(Equal.equals([1, 2], [1, 3]) === false)\n\n// Date equality by ISO string\nconst date1 = new Date("2023-01-01")\nconst date2 = new Date("2023-01-01")\nassert(Equal.equals(date1, date2) === true)\n\n// Maps and Sets - structural comparison\nconst map1 = new Map([["a", 1], ["b", 2]])\nconst map2 = new Map([["b", 2], ["a", 1]]) // different order\nassert(Equal.equals(map1, map2) === true)\n\n// Curried version\nconst isEqualTo5 = Equal.equals(5)\nassert(isEqualTo5(5) === true)\nassert(isEqualTo5(3) === false)';
const moduleRecord = EqualModule as Record<string, unknown>;

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
