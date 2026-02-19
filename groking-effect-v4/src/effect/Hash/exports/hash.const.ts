/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Hash
 * Export: hash
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Hash.ts
 * Generated: 2026-02-19T04:14:13.635Z
 *
 * Overview:
 * Computes a hash value for any given value.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Hash } from "effect"
 *
 * // Hash primitive values
 * console.log(Hash.hash(42)) // numeric hash
 * console.log(Hash.hash("hello")) // string hash
 * console.log(Hash.hash(true)) // boolean hash
 *
 * // Hash objects and arrays
 * console.log(Hash.hash({ name: "John", age: 30 }))
 * console.log(Hash.hash([1, 2, 3]))
 * console.log(Hash.hash(new Date("2023-01-01")))
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
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as HashModule from "effect/Hash";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "hash";
const exportKind = "const";
const moduleImportPath = "effect/Hash";
const sourceSummary = "Computes a hash value for any given value.";
const sourceExample =
  'import { Hash } from "effect"\n\n// Hash primitive values\nconsole.log(Hash.hash(42)) // numeric hash\nconsole.log(Hash.hash("hello")) // string hash\nconsole.log(Hash.hash(true)) // boolean hash\n\n// Hash objects and arrays\nconsole.log(Hash.hash({ name: "John", age: 30 }))\nconsole.log(Hash.hash([1, 2, 3]))\nconsole.log(Hash.hash(new Date("2023-01-01")))';
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
  bunContext: BunContext,
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
