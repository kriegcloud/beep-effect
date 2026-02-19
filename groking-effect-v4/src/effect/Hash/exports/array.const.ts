/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Hash
 * Export: array
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Hash.ts
 * Generated: 2026-02-19T04:14:13.635Z
 *
 * Overview:
 * Computes a hash value for an array by hashing all of its elements.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Hash } from "effect"
 * 
 * const arr1 = [1, 2, 3]
 * const arr2 = [1, 2, 3]
 * const arr3 = [3, 2, 1]
 * 
 * console.log(Hash.array(arr1)) // hash of [1, 2, 3]
 * console.log(Hash.array(arr2)) // same hash as arr1
 * console.log(Hash.array(arr3)) // different hash (different order)
 * 
 * // Arrays with same elements in same order produce same hash
 * console.log(Hash.array(arr1) === Hash.array(arr2)) // true
 * console.log(Hash.array(arr1) === Hash.array(arr3)) // false
 * ```
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */
import * as Effect from "effect/Effect";
import * as Console from "effect/Console";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as HashModule from "effect/Hash";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "array";
const exportKind = "const";
const moduleImportPath = "effect/Hash";
const sourceSummary = "Computes a hash value for an array by hashing all of its elements.";
const sourceExample = "import { Hash } from \"effect\"\n\nconst arr1 = [1, 2, 3]\nconst arr2 = [1, 2, 3]\nconst arr3 = [3, 2, 1]\n\nconsole.log(Hash.array(arr1)) // hash of [1, 2, 3]\nconsole.log(Hash.array(arr2)) // same hash as arr1\nconsole.log(Hash.array(arr3)) // different hash (different order)\n\n// Arrays with same elements in same order produce same hash\nconsole.log(Hash.array(arr1) === Hash.array(arr2)) // true\nconsole.log(Hash.array(arr1) === Hash.array(arr3)) // false";
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
      run: exampleRuntimeInspection
    },
    {
      title: "Callable Value Probe",
      description: "Attempt a zero-arg invocation when the value is function-like.",
      run: exampleCallableProbe
    }
  ]
});

BunRuntime.runMain(program);
