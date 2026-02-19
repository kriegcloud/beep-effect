/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Hash
 * Export: random
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Hash.ts
 * Generated: 2026-02-19T04:50:36.819Z
 *
 * Overview:
 * Generates a random hash value for an object and caches it.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Hash } from "effect"
 *
 * const obj1 = { a: 1 }
 * const obj2 = { a: 1 }
 *
 * // Same object always returns the same hash
 * console.log(Hash.random(obj1) === Hash.random(obj1)) // true
 *
 * // Different objects get different hashes
 * console.log(Hash.random(obj1) === Hash.random(obj2)) // false
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
const exportName = "random";
const exportKind = "const";
const moduleImportPath = "effect/Hash";
const sourceSummary = "Generates a random hash value for an object and caches it.";
const sourceExample =
  'import { Hash } from "effect"\n\nconst obj1 = { a: 1 }\nconst obj2 = { a: 1 }\n\n// Same object always returns the same hash\nconsole.log(Hash.random(obj1) === Hash.random(obj1)) // true\n\n// Different objects get different hashes\nconsole.log(Hash.random(obj1) === Hash.random(obj2)) // false';
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
