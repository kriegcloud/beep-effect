/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Hash
 * Export: string
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Hash.ts
 * Generated: 2026-02-19T04:14:13.635Z
 *
 * Overview:
 * Computes a hash value for a string using the djb2 algorithm.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Hash } from "effect"
 *
 * console.log(Hash.string("hello")) // hash of "hello"
 * console.log(Hash.string("world")) // hash of "world"
 * console.log(Hash.string("")) // hash of empty string
 *
 * // Same strings produce the same hash
 * console.log(Hash.string("test") === Hash.string("test")) // true
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
const exportName = "string";
const exportKind = "const";
const moduleImportPath = "effect/Hash";
const sourceSummary = "Computes a hash value for a string using the djb2 algorithm.";
const sourceExample =
  'import { Hash } from "effect"\n\nconsole.log(Hash.string("hello")) // hash of "hello"\nconsole.log(Hash.string("world")) // hash of "world"\nconsole.log(Hash.string("")) // hash of empty string\n\n// Same strings produce the same hash\nconsole.log(Hash.string("test") === Hash.string("test")) // true';
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
