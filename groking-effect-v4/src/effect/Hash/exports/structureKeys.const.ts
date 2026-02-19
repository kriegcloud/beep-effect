/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Hash
 * Export: structureKeys
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Hash.ts
 * Generated: 2026-02-19T04:50:36.819Z
 *
 * Overview:
 * Computes a hash value for an object using only the specified keys.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Hash } from "effect"
 *
 * const person = { name: "John", age: 30, city: "New York" }
 *
 * // Hash only specific keys
 * const hash1 = Hash.structureKeys(person, ["name", "age"])
 * const hash2 = Hash.structureKeys(person, ["name", "city"])
 *
 * console.log(hash1) // hash based on name and age
 * console.log(hash2) // hash based on name and city
 *
 * // Same keys produce the same hash
 * const person2 = { name: "John", age: 30, city: "Boston" }
 * const hash3 = Hash.structureKeys(person2, ["name", "age"])
 * console.log(hash1 === hash3) // true
 * ```
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */

import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction,
} from "@beep/groking-effect-v4/runtime/Playground";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as HashModule from "effect/Hash";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "structureKeys";
const exportKind = "const";
const moduleImportPath = "effect/Hash";
const sourceSummary = "Computes a hash value for an object using only the specified keys.";
const sourceExample =
  'import { Hash } from "effect"\n\nconst person = { name: "John", age: 30, city: "New York" }\n\n// Hash only specific keys\nconst hash1 = Hash.structureKeys(person, ["name", "age"])\nconst hash2 = Hash.structureKeys(person, ["name", "city"])\n\nconsole.log(hash1) // hash based on name and age\nconsole.log(hash2) // hash based on name and city\n\n// Same keys produce the same hash\nconst person2 = { name: "John", age: 30, city: "Boston" }\nconst hash3 = Hash.structureKeys(person2, ["name", "age"])\nconsole.log(hash1 === hash3) // true';
const moduleRecord = HashModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect the export as a runtime value and capture shape/preview.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleCallableProbe = Effect.gen(function* () {
  yield* Console.log("If the value is callable, run a zero-arg probe to observe behavior.");
  yield* probeNamedExportFunction({ moduleRecord, exportName });
});

/* ========================================================================== *
 * Program
 * ========================================================================== */
const program = createPlaygroundProgram({
  icon: "🔎",
  moduleImportPath,
  exportName,
  exportKind,
  summary: sourceSummary,
  sourceExample,
  examples: [
    {
      title: "Runtime Shape Inspection",
      description: "Inspect module export count, runtime type, and formatted preview.",
      run: exampleRuntimeInspection,
    },
    {
      title: "Callable Value Probe",
      description: "Attempt a zero-arg invocation when the value is function-like.",
      run: exampleCallableProbe,
    },
  ],
});

BunRuntime.runMain(program);
