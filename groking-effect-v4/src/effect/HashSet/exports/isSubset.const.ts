/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/HashSet
 * Export: isSubset
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/HashSet.ts
 * Generated: 2026-02-19T04:14:14.176Z
 *
 * Overview:
 * Checks if a HashSet is a subset of another HashSet.
 *
 * Source JSDoc Example:
 * ```ts
 * import * as HashSet from "effect/HashSet"
 * 
 * const small = HashSet.make("a", "b")
 * const large = HashSet.make("a", "b", "c", "d")
 * const other = HashSet.make("x", "y")
 * 
 * console.log(HashSet.isSubset(small, large)) // true
 * console.log(HashSet.isSubset(large, small)) // false
 * console.log(HashSet.isSubset(small, other)) // false
 * console.log(HashSet.isSubset(small, small)) // true
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
const exportName = "isSubset";
const exportKind = "const";
const moduleImportPath = "effect/HashSet";
const sourceSummary = "Checks if a HashSet is a subset of another HashSet.";
const sourceExample = "import * as HashSet from \"effect/HashSet\"\n\nconst small = HashSet.make(\"a\", \"b\")\nconst large = HashSet.make(\"a\", \"b\", \"c\", \"d\")\nconst other = HashSet.make(\"x\", \"y\")\n\nconsole.log(HashSet.isSubset(small, large)) // true\nconsole.log(HashSet.isSubset(large, small)) // false\nconsole.log(HashSet.isSubset(small, other)) // false\nconsole.log(HashSet.isSubset(small, small)) // true";
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
