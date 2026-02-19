/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/HashMap
 * Export: every
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/HashMap.ts
 * Generated: 2026-02-19T04:14:13.824Z
 *
 * Overview:
 * Checks if all entries in a hashmap meets a specific condition.
 *
 * Source JSDoc Example:
 * ```ts
 * import * as HashMap from "effect/HashMap"
 *
 * const map = HashMap.make(["a", 1], ["b", 2], ["c", 3])
 *
 * console.log(HashMap.every(map, (value) => value > 0)) // true
 * console.log(HashMap.every(map, (value) => value > 1)) // false
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
import * as HashMapModule from "effect/HashMap";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "every";
const exportKind = "const";
const moduleImportPath = "effect/HashMap";
const sourceSummary = "Checks if all entries in a hashmap meets a specific condition.";
const sourceExample =
  'import * as HashMap from "effect/HashMap"\n\nconst map = HashMap.make(["a", 1], ["b", 2], ["c", 3])\n\nconsole.log(HashMap.every(map, (value) => value > 0)) // true\nconsole.log(HashMap.every(map, (value) => value > 1)) // false';
const moduleRecord = HashMapModule as Record<string, unknown>;

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
