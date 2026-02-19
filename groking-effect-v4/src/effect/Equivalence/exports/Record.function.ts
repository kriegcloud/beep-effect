/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Equivalence
 * Export: Record
 * Kind: function
 * Source: .repos/effect-smol/packages/effect/src/Equivalence.ts
 * Generated: 2026-02-19T04:14:12.631Z
 *
 * Overview:
 * Creates an equivalence for objects by comparing all properties using the same equivalence.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Equivalence } from "effect"
 *
 * const stringRecordEq = Equivalence.Record(Equivalence.strictEqual<string>())
 *
 * const record1 = { a: "hello", b: "world" }
 * const record2 = { a: "hello", b: "world" }
 * const record3 = { a: "hello", b: "different" }
 * const record4 = { a: "hello" } // missing key 'b'
 *
 * console.log(stringRecordEq(record1, record2)) // true
 * console.log(stringRecordEq(record1, record3)) // false
 * console.log(stringRecordEq(record1, record4)) // false (different keys)
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
const exportName = "Record";
const exportKind = "function";
const moduleImportPath = "effect/Equivalence";
const sourceSummary = "Creates an equivalence for objects by comparing all properties using the same equivalence.";
const sourceExample =
  'import { Equivalence } from "effect"\n\nconst stringRecordEq = Equivalence.Record(Equivalence.strictEqual<string>())\n\nconst record1 = { a: "hello", b: "world" }\nconst record2 = { a: "hello", b: "world" }\nconst record3 = { a: "hello", b: "different" }\nconst record4 = { a: "hello" } // missing key \'b\'\n\nconsole.log(stringRecordEq(record1, record2)) // true\nconsole.log(stringRecordEq(record1, record3)) // false\nconsole.log(stringRecordEq(record1, record4)) // false (different keys)';
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
