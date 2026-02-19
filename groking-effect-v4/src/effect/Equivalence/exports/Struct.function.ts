/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Equivalence
 * Export: Struct
 * Kind: function
 * Source: .repos/effect-smol/packages/effect/src/Equivalence.ts
 * Generated: 2026-02-19T04:14:12.631Z
 *
 * Overview:
 * Creates an equivalence for objects by comparing their properties using provided equivalences.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Equivalence } from "effect"
 *
 * interface Person {
 *   name: string
 *   age: number
 *   email: string
 * }
 *
 * const caseInsensitive = Equivalence.mapInput(
 *   Equivalence.strictEqual<string>(),
 *   (s: string) => s.toLowerCase()
 * )
 *
 * const personEq = Equivalence.Struct({
 *   name: caseInsensitive,
 *   age: Equivalence.strictEqual<number>(),
 *   email: caseInsensitive
 * })
 *
 * const person1 = { name: "Alice", age: 30, email: "alice@example.com" }
 * const person2 = { name: "ALICE", age: 30, email: "ALICE@EXAMPLE.COM" }
 * const person3 = { name: "Alice", age: 31, email: "alice@example.com" }
 *
 * console.log(personEq(person1, person2)) // true (case-insensitive match)
 * console.log(personEq(person1, person3)) // false (different age)
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
const exportName = "Struct";
const exportKind = "function";
const moduleImportPath = "effect/Equivalence";
const sourceSummary = "Creates an equivalence for objects by comparing their properties using provided equivalences.";
const sourceExample =
  'import { Equivalence } from "effect"\n\ninterface Person {\n  name: string\n  age: number\n  email: string\n}\n\nconst caseInsensitive = Equivalence.mapInput(\n  Equivalence.strictEqual<string>(),\n  (s: string) => s.toLowerCase()\n)\n\nconst personEq = Equivalence.Struct({\n  name: caseInsensitive,\n  age: Equivalence.strictEqual<number>(),\n  email: caseInsensitive\n})\n\nconst person1 = { name: "Alice", age: 30, email: "alice@example.com" }\nconst person2 = { name: "ALICE", age: 30, email: "ALICE@EXAMPLE.COM" }\nconst person3 = { name: "Alice", age: 31, email: "alice@example.com" }\n\nconsole.log(personEq(person1, person2)) // true (case-insensitive match)\nconsole.log(personEq(person1, person3)) // false (different age)';
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
