/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Hash
 * Export: isHash
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Hash.ts
 * Generated: 2026-02-19T04:14:13.635Z
 *
 * Overview:
 * Checks if a value implements the Hash interface.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Hash } from "effect"
 *
 * class MyHashable implements Hash.Hash {
 *   [Hash.symbol]() {
 *     return 42
 *   }
 * }
 *
 * const obj = new MyHashable()
 * console.log(Hash.isHash(obj)) // true
 * console.log(Hash.isHash({})) // false
 * console.log(Hash.isHash("string")) // false
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
const exportName = "isHash";
const exportKind = "const";
const moduleImportPath = "effect/Hash";
const sourceSummary = "Checks if a value implements the Hash interface.";
const sourceExample =
  'import { Hash } from "effect"\n\nclass MyHashable implements Hash.Hash {\n  [Hash.symbol]() {\n    return 42\n  }\n}\n\nconst obj = new MyHashable()\nconsole.log(Hash.isHash(obj)) // true\nconsole.log(Hash.isHash({})) // false\nconsole.log(Hash.isHash("string")) // false';
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
