/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/HashSet
 * Export: every
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/HashSet.ts
 * Generated: 2026-02-19T04:14:14.176Z
 *
 * Overview:
 * Tests whether all values in the HashSet satisfy the predicate.
 *
 * Source JSDoc Example:
 * ```ts
 * import * as HashSet from "effect/HashSet"
 * 
 * const numbers = HashSet.make(2, 4, 6, 8)
 * 
 * console.log(HashSet.every(numbers, (n) => n % 2 === 0)) // true
 * console.log(HashSet.every(numbers, (n) => n > 5)) // false
 * 
 * const empty = HashSet.empty<number>()
 * console.log(HashSet.every(empty, (n) => n > 0)) // true (vacuously true)
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
import * as HashSetModule from "effect/HashSet";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "every";
const exportKind = "const";
const moduleImportPath = "effect/HashSet";
const sourceSummary = "Tests whether all values in the HashSet satisfy the predicate.";
const sourceExample = "import * as HashSet from \"effect/HashSet\"\n\nconst numbers = HashSet.make(2, 4, 6, 8)\n\nconsole.log(HashSet.every(numbers, (n) => n % 2 === 0)) // true\nconsole.log(HashSet.every(numbers, (n) => n > 5)) // false\n\nconst empty = HashSet.empty<number>()\nconsole.log(HashSet.every(empty, (n) => n > 0)) // true (vacuously true)";
const moduleRecord = HashSetModule as Record<string, unknown>;

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
