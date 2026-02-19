/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Hash
 * Export: structure
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Hash.ts
 * Generated: 2026-02-19T04:14:13.635Z
 *
 * Overview:
 * Computes a hash value for an object using all of its enumerable keys.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Hash } from "effect"
 * 
 * const obj1 = { name: "John", age: 30 }
 * const obj2 = { name: "Jane", age: 25 }
 * const obj3 = { name: "John", age: 30 }
 * 
 * console.log(Hash.structure(obj1)) // hash of obj1
 * console.log(Hash.structure(obj2)) // different hash
 * console.log(Hash.structure(obj3)) // same as obj1
 * 
 * // Objects with same properties produce same hash
 * console.log(Hash.structure(obj1) === Hash.structure(obj3)) // true
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
const exportName = "structure";
const exportKind = "const";
const moduleImportPath = "effect/Hash";
const sourceSummary = "Computes a hash value for an object using all of its enumerable keys.";
const sourceExample = "import { Hash } from \"effect\"\n\nconst obj1 = { name: \"John\", age: 30 }\nconst obj2 = { name: \"Jane\", age: 25 }\nconst obj3 = { name: \"John\", age: 30 }\n\nconsole.log(Hash.structure(obj1)) // hash of obj1\nconsole.log(Hash.structure(obj2)) // different hash\nconsole.log(Hash.structure(obj3)) // same as obj1\n\n// Objects with same properties produce same hash\nconsole.log(Hash.structure(obj1) === Hash.structure(obj3)) // true";
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
